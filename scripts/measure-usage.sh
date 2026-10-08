#!/usr/bin/env bash
# Mesure le footprint de la stack ProTab : poids des images, occupation mémoire
# et CPU, volume de données. Pensé pour être rejoué sur le serveur de production,
# où la question posée est « combien de ressources cette stack consomme-t-elle ? ».
#
# Le rapport chiffré et son interprétation sont dans docs/ressources.md ; ce script
# ne produit que des mesures brutes, sans seuil ni verdict.
#
#   ./scripts/measure-usage.sh              # relevé complet
#   ./scripts/measure-usage.sh --images     # uniquement le poids disque
#
# Sortie : rapport texte sur stdout. Aucun conteneur n'est créé ni arrêté.

set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

IMAGES_ONLY=0
[[ "${1:-}" == "--images" ]] && IMAGES_ONLY=1

# --- helpers -----------------------------------------------------------------

human() { numfmt --to=iec-i --suffix=B --format='%.1f' "$1" 2>/dev/null || echo "$1"; }

# Taille décompressée, en octets : somme des tailles des couches.
# `docker image inspect .Size` ne la donne pas — sous le snapshotter containerd
# il renvoie la taille des blobs compressés. Seule la somme de `docker history`
# reconstitue la taille telle qu'elle existe une fois écrite sur le disque hôte.
image_uncompressed() {
    docker history "$1" --no-trunc --format '{{.Size}}' 2>/dev/null |
        python3 -c '
import re, sys

def to_bytes(text):
    m = re.match(r"([\d.]+)\s*([KMGT]?)B?$", text.strip(), re.IGNORECASE)
    if not m:
        return 0
    return float(m.group(1)) * {"": 1, "K": 1024, "M": 1024**2, "G": 1024**3, "T": 1024**4}[m.group(2).upper()]

print(int(sum(to_bytes(l) for l in sys.stdin if l.strip())))'
}

# Taille réellement occupée sur le disque hôte : les blobs compressés du store.
# C'est la métrique qui compte pour un serveur, ~5x plus petite que l'autre.
image_on_disk() {
    docker image inspect "$1" --format '{{.Size}}' 2>/dev/null | head -1
}

# Taille de la couche inscriptible d'un conteneur. `docker inspect .SizeRw` vaut
# `<nil>` sous le snapshotter containerd (le cas courant sur Docker 29), donc on
# passe par `docker ps --size`, qui sait encore le lire.
container_writable() {
    docker ps -a --size --filter "id=$1" --format '{{.Size}}' 2>/dev/null | head -1
}

require_stack() {
    if ! docker compose ps --services --status running 2>/dev/null | grep -q .; then
        echo "La stack n'est pas demarree : lancez 'make docker-up' d'abord." >&2
        exit 1
    fi
}

# --- 1. Hote -----------------------------------------------------------------

print_host() {
    echo "== Hote =="
    printf '  CPU    : %s coeurs\n' "$(nproc)"
    printf '  RAM    : %s\n' "$(free -h | awk '/^Mem:/ {print $2 " total, " $7 " disponible"}')"
    printf '  Disque  : %s\n' "$(df -h / | awk 'NR==2 {print $4 " libres sur " $2}')
" | tr -d '\n'
    printf '\n  Docker : %s (%s)\n\n' \
        "$(docker version --format '{{.Server.Version}}' 2>/dev/null)" \
        "$(docker info --format '{{.Driver}}' 2>/dev/null)"
}

# --- 2. Poids des images -----------------------------------------------------

print_images() {
    echo "== Poids des images =="
    printf '  %-24s %14s %14s   %s\n' IMAGE "SUR DISQUE" "DÉCOMP." "CONTENEURS"

    local total_disk=0 total_raw=0
    local service image id disk raw containers label

    # Colonnes de `docker compose images` :
    #   CONTAINER REPOSITORY TAG PLATFORM IMAGE-ID SIZE CREATED
    # L'IMAGE-ID est abrege, ce que `docker image inspect` accepte comme prefixe.
    # awk isole les trois champs utiles et emet une ligne par image. On ne peut pas
    # indexer `docker compose config --images` par position : l'ordre de sortie ne
    # suit pas l'ordre des services.
    # `< /dev/null` est indispensable : sans lui, la commande `docker` suivante
    # consomme le flux du pipe et le calcul tombe a zero.
    while read -r label id; do
        [[ -z "$id" ]] && continue

        disk=$(image_on_disk "$id" < /dev/null)
        raw=$(image_uncompressed "$id" < /dev/null)
        containers=$(docker ps -a --filter "ancestor=$id" -q 2>/dev/null < /dev/null | wc -l | tr -d ' ')

        total_disk=$(( total_disk + disk ))
        total_raw=$(( total_raw + raw ))

        printf '  %-24s %14s %14s   %s\n' "$label" "$(human "$disk")" "$(human "$raw")" "$containers"
    done < <(docker compose images 2>/dev/null | tail -n +2 |
             awk 'NF >= 5 { print tolower($2) ":" tolower($3), $5 }')

    printf '  %-24s %14s %14s\n' TOTAL "$(human "$total_disk")" "$(human "$total_raw")"
    echo
}

# --- 3. Conteneurs : couche inscriptible et volume de donnees ---------------

print_containers() {
    echo "== Conteneurs =="
    printf '  %-22s %-14s %s\n' SERVICE "COUCHE ECRIT." "STATUT"

    local service container size status
    for service in api db frontend; do
        container=$(docker compose ps -q "$service" 2>/dev/null)
        [[ -z "$container" ]] && continue
        size=$(container_writable "$container")
        status=$(docker inspect "$container" --format '{{.State.Status}}{{if .State.Health}} ({{.State.Health.Status}}){{end}}' 2>/dev/null)
        printf '  %-22s %-14s %s\n' "$service" "$size" "$status"
    done
    echo

    echo "  Volume pgdata :"
    docker compose exec -T db du -sh /var/lib/postgresql/data 2>/dev/null | sed 's/^/    total /'
    docker compose exec -T db du -sh /var/lib/postgresql/data/pg_wal 2>/dev/null | sed 's/^/    pg_wal /'
    echo

    echo "  Base de donnees (contenu utile) :"
    docker compose exec -T db psql -U protab -d protab -tAc \
        "SELECT '    ' || relname || ' : ' || n_live_tup || ' lignes, ' || pg_size_pretty(pg_total_relation_size(relid))
         FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;" 2>/dev/null
    docker compose exec -T db psql -U protab -d protab -tAc \
        "SELECT '    total : ' || pg_size_pretty(pg_database_size('protab'));" 2>/dev/null
    echo
}

# --- 4. Consommation memoire et CPU -----------------------------------------

print_runtime() {
    echo "== Consommation memoire / CPU (au repos, 3 echantillons) =="
    printf '  %-12s %10s %18s %8s\n' SERVICE CPU MEMOIRE PIDS

    local service line cpu mem pids
    for service in api db frontend; do
        docker compose ps -q "$service" >/dev/null 2>&1 || continue
        line=$(docker stats --no-stream \
            --format '{{.CPUPerc}}|{{.MemUsage}}|{{.PIDs}}' "$(docker compose ps -q "$service")" 2>/dev/null | head -1)
        cpu=$(echo "$line" | cut -d'|' -f1)
        mem=$(echo "$line" | cut -d'|' -f2)
        pids=$(echo "$line" | cut -d'|' -f3)
        printf '  %-12s %10s %18s %8s\n' "$service" "$cpu" "$mem" "$pids"
    done
    echo
}

print_processes() {
    echo "== Processus par service =="
    echo "  Un service 'api' qui n'affiche qu'une ligne = un seul processus uvicorn."
    echo "  C'est le plafond de debit de la stack : voir docs/ressources.md."
    echo

    local service container
    for service in api db frontend; do
        container=$(docker compose ps -q "$service" 2>/dev/null)
        [[ -z "$container" ]] && continue
        echo "  $service :"
        docker top "$container" -eo pid,pcpu,rss,comm 2>/dev/null | head -8 | sed 's/^/    /'
    done
    echo
}

# --- 5. Garde-fou : artefacts de developpement dans les images ---------------

print_devenv_guard() {
    echo "== Artefacts de developpement dans les images =="
    echo "  Poids des repertoires qui n'ont rien a faire dans une image finale."
    echo "  Tout chiffre non nul ici indique un .dockerignore trop laxiste."

    local service container leftovers=0
    for service in api frontend; do
        container=$(docker compose ps -q "$service" 2>/dev/null)
        [[ -z "$container" ]] && continue

        while read -r path size; do
            [[ -z "$path" ]] && continue
            leftovers=1
            printf '  %-10s %-34s %s\n' "$service" "$path" "$size"
        done < <(docker exec "$container" sh -c \
            'for d in /app/node_modules /app/src/FrontEnd/node_modules /app/src/FrontEnd/dist \
                      /usr/share/nginx/html/node_modules /app/.venv/build; do
                 [ -e "$d" ] && du -sh "$d" 2>/dev/null | tr "\t" " ";
             done' 2>/dev/null)
    done

    [[ $leftovers -eq 0 ]] && echo "  aucun (correct)"
    echo
}

# --- 6. Configuration PostgreSQL qui influe sur la memoire ------------------

print_postgres_settings() {
    echo "== Parametres PostgreSQL influant sur la memoire =="
    docker compose exec -T db psql -U protab -d protab -c \
        "SELECT name, setting, unit FROM pg_settings
         WHERE name IN ('shared_buffers','work_mem','maintenance_work_mem','effective_cache_size','max_connections')
         ORDER BY name;" 2>/dev/null || echo "  (base injoignable)"
    echo "  Ces valeurs sont les defauts PostgreSQL, supposeant une machine sizeable."
    echo "  A regler explicitement sur un petit serveur : voir docs/ressources.md."
    echo
}

# --- 7. Ce que ce script ne mesure pas ---------------------------------------

print_limits() {
    echo "== Limites de ressources =="
    if docker compose config 2>/dev/null | grep -qE '^\s+(mem_limit|cpus):'; then
        echo "  des limites sont declarees dans docker-compose.yml"
    else
        echo "  AUCUNE limite declaree dans docker-compose.yml."
        echo "  Docker stats affiche donc la memoire de l'hote comme plafond, pas un"
        echo "  plafond propre au service : un service qui derape n'est pas arrete."
    fi
    echo
}

print_disk_totals() {
    echo "== Occupation du store Docker (toutes images, tous projets) =="
    docker system df 2>/dev/null | sed 's/^/  /'
    echo "  Attention : ces volumes raisonnent en taille decompressee, pas en octets"
    echo "  reels occupes. Le cache de build domine et n'appartient pas a ProTab."
    echo
}

# --- main --------------------------------------------------------------------

print_host
print_images

if [[ $IMAGES_ONLY -eq 0 ]]; then
    require_stack
    print_containers
    print_runtime
    print_processes
    print_devenv_guard
    print_postgres_settings
    print_limits
    print_disk_totals
fi

echo "Reference : docs/ressources.md"