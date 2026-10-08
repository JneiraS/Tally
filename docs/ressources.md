# Ressources consommées par la stack

Ce document répond à une question unique : **combien de ressources la stack ProTab consomme-t-elle,
et combien en faudrait-il sur un serveur ?** Les chiffres viennent d'un relevé fait avec
`make resources` sur une machine de développement (16 cœurs, 23 Gio de RAM, Docker 29.7.2,
snapshotter containerd). Ce ne sont pas des garanties de performance : ce sont des ordres de
grandeur, avec la méthode pour les rejouer.

La topologie elle-même est dans [`docker-architecture.md`](docker-architecture.md) ; ce document ne
la redit pas.

---

## 1. Poids sur le disque

Deux métriques coexistent, et les confondre conduit à annoncer un chiffre faux d'un facteur 3 à 5.

| Image | Sur disque (compressé) | Décompressée |
| ----------------------- | ----------------------: | -----------: |
| `protab-api:latest`     | **55.8 Mio**            | 188.8 Mio    |
| `postgres:17-alpine`    | 111.8 Mio               | 306.3 Mio    |
| `protab-frontend:latest`| 25.4 Mio                | 69.4 Mio     |
| **Total**               | **192.9 Mio**           | **564.4 Mio**|

La colonne **sur disque** est celle qui compte pour dimensionner un serveur : c'est la taille des
blobs compressés dans le store local. `docker image inspect .Size` la donne sous le snapshotter
containerd, qui est le cas par défaut depuis Docker 25 — mais sous un store classique elle vaut la
somme des couches décompressées, d'où le recours à `docker history` pour reconstituer la seconde
colonne. **Si votre `docker system df` affiche un volume très supérieur à 192.9 Mio pour ces trois
images, c'est normal** : il raisonne en décompressé et compte aussi le cache de construction (§5).

Couches inscriptibles des conteneurs — ce qui s'écrit *après* le démarrage :

| Service   | Couche inscriptible |
| --------- | ------------------: |
| `api`     | 11.1 Mio            |
| `db`      | 4.1 kio             |
| `frontend`| 4.1 kio             |

Volume `protab_pgdata` : **70.7 Mio**, dont 32.0 Mio de `pg_wal`, pour 8.4 Mio de données
réellement utiles. Le rapport WAL/données est normal juste après une activité, il se résorbe au
prochain checkpoint.

**Ce que cette mesure ne dit pas.** Je n'ai pas mesuré `du -sh /var/lib/docker`, faute d'accès root
sur la machine de développement. Le store Docker contient les images de tous les projets de la
machine, pas seulement ProTab, et l'agrégat n'est donc pas attribuable à la stack. Sur un serveur
dédié, la somme des colonnes « sur disque » ci-dessus est le bon ordre de grandeur ; sur une machine
partagée, il faut passer par `docker system df` en gardant en tête qu'il compte en décompressé.

---

## 2. Consommation mémoire et CPU au repos

| Service    | CPU     | Mémoire   | Processus |
| ---------- | ------: | --------: | --------- |
| `api`      | 0.20 %  | 57 Mio    | **1**     |
| `db`       | 0.00 %  | 42.8 Mio  | 12        |
| `frontend` | 0.00 %  | 13.3 Mio  | 17        |

**Total : environ 113 Mio de RAM**, dont 57 Mio pour l'API. C'est le plancher réel de la stack : il
augmente avec les données (§1) et avec le trafic, jamais en dessous.

La ligne `api` mérite d'être lue : **un seul processus**, `protab`, avec un RSS de 77 Mio. Ce n'est
pas un détail d'affichage, c'est le plafond de débit de toute la stack (§4). `docker top` le vérifie
en une commande, et `make resources` l'affiche systématiquement.

Les 12 processus de `db` sont les backends PostgreSQL : un `postmaster` et un backend par connexion
du pool. Le pool est configuré `min_size=2`, `max_size=10`
(`adapters/outbound/persistence/postgres_pool.py`), donc 2 à 10 backends selon la charge — le 12ème
vient de mes propres connexions d'administration.

---

## 3. Comportement sous charge

Relevé avec 16 clients concurrents sur `/healthz` :

| Service | CPU    | Mémoire |
| ------- | -----: | ------: |
| `api`   | 98 %   | 59.8 Mio |
| `db`    | 0.07 % | 54.7 Mio |

L'API sature **un cœur** et la mémoire ne bouge pas de plus de 3 Mio. Ce profil est celui attendu
d'un serveur d'application asynchrone : la consommation mémoire est stable, la consommation CPU est
proportionnelle au trafic.

Le point important pour un dimensionnement : **le CPU de l'API ne peut pas dépasser 100 % par
processus**, et il n'y a qu'un processus. La stack ne monte pas en charge en ajoutant des cœurs, elle
monte en ajoutant des **répliques**. `uvicorn.run()` est appelé sans `workers`
(`src/protab/__init__.py`), donc ni multi-processus ni multi-coeur.

---

## 4. Débit et latence

Méthode : clients HTTP concurrents en Python, 5 secondes par mesure, contre l'API sur
`127.0.0.1:8874`, un seul processus de mesure, latences échantillonnées au 1/5.

| Endpoint           | Clients | Requêtes/s | Médiane | p95      |
| ------------------ | ------: | ---------: | ------: | -------: |
| `/healthz`         |       1 |     460.3  |  2.15 ms|  3.09 ms  |
| `/healthz`         |       8 |   1 097.9  |  6.98 ms| 11.02 ms  |
| `/healthz`         |      32 |   1 262.2  | 24.63 ms| 36.01 ms  |
| `/projects` (SQL)  |       8 |     480.7  | 16.06 ms| 25.29 ms  |

Deux lectures utiles :

- **Le débit double de 1 à 8 clients, puis stagne.** C'est la saturation du processus unique (§3),
  pas un goulot d'étranglement de la base : `/projects` qui va pourtant jusqu'en SQL tient 480 req/s
  à 8 clients.
- **`/projects` est ~4x plus lent que `/healthz` à charge égale.** C'est le coût d'une requête réelle
  contre PostgreSQL, pas de la couche HTTP.

**Ces chiffres ne sont pas un SLA.** Un client Python sur la même machine que le serveur n'ajoute
pratiquement aucune latence réseau, alors qu'en production le RTT s'ajoute à chaque requête. Ils
indiquent un ordre de grandeur et le point de saturation, pas une capacité contractuelle. Pour une
capacité réelle, il faudrait un test de charge depuis une machine séparée, sur l'instance de
production.

---

## 5. Ce qui n'appartient pas à la stack

```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          17        7         5.404GB   443.5MB (8%)
Containers      8         6         199.2MB   0B (0%)
Local Volumes   18        7         200.8MB   0B (0%)
Build Cache     773       19        71.57GB   68.68GB
```

Le **cache de construction pèse 71.6 Go, dont 68.7 Go récupérables** — soit 98 % de l'occupation
Docker de cette machine, pour 11 images en service. Il est growné par les builds de tous les projets
(skillmatrix, edulink, ProTab), pas par ProTab : un `docker builder prune` le libère sans toucher à
la stack en service.

Sur un serveur de production, on ne construit pas : le cache reste vide et cette ligne disparaît. Sur
une machine de développement partagée, c'est la première chose à nettoyer quand le disque se remplit.

---

## 6. Configuration PostgreSQL et mémoire

Valeurs relevées sur le conteneur en service :

| Paramètre             | Valeur   | Lecture                                        |
| --------------------- | -------- | ---------------------------------------------- |
| `shared_buffers`      | 128 Mio  | mémoire partagée réservée par le postmaster     |
| `work_mem`            | 4 Mio    | **par opération, par connexion** — 100 connexions × 2 tris = 800 Mio possibles |
| `maintenance_work_mem`| 64 Mio   | `VACUUM`, `CREATE INDEX`                       |
| `effective_cache_size`| 4 Gio    | hypothèse du planificateur, **pas une réservation** |
| `max_connections`     | 100      | vs. un pool de 10 : les 90 autres restent possibles |

Ce sont les **défauts PostgreSQL**, qui supposent une machine sizeable. Sur un petit serveur, deux
d'entre eux méritent d'être ajustés :

- **`shared_buffers` à 128 Mio** est réservé dès le démarrage du postmaster, même sur une base vide.
  Sur un VPS à 512 Mio, c'est un quart de la mémoire de la machine prise d'avance.
- **`effective_cache_size` à 4 Gio** ne réserve rien et n'a aucun effet sur la mémoire réelle : c'est
  une promesse faite au planificateur sur le cache disponible. La laisser à 4 Gio sur une machine de
  512 Mio conduit le planificateur à préférer des plans par index inapplicables. Elle se règle par
  commande de serveur, pas par variable d'environnement dans `docker-compose.yml`.

Ces valeurs se règlent par un `command:` sur le service `db`, avec des `-c nom=valeur`. Ce n'est pas
fait ici : le réglage est un choix de déploiement, pas une correction, et il mérite d'être mesuré sur
les données réelles du serveur cible.

---

## 7. Dimensionnement

En combinant §1 et §2, sur la base d'un petit parc de périmètres (33 périmètres, 362 activités
quotidiennes, 512 événements de journal dans la base de développement) :

| Ressource      | Plancher        | Confortable          |
| -------------- | --------------- | -------------------- |
| CPU            | 1 vCPU          | 2 vCPU               |
| RAM            | 512 Mio         | 1 Gio                |
| Disque (images)| 200 Mio         | 500 Mio              |
| Disque (données)| ~20 Mio/an     | prévoir la croissance du WAL |

**512 Mio tient** : 113 Mio de stack au repos, plus 128 Mio de `shared_buffers`, plus le système
d'exploitation et la marge. Mais un seul vCPU signifie que toute la stack est plafonnée par le
processus unique de l'API, et que le moindre `docker build` sur la machine entre en concurrence.

**1 Gio / 2 vCPU est le plancher raisonnable** pour un usage réel : la RAM pour que PostgreSQL
respire, et le second cœur pour que la maintenance ne concurrence pas le service.

Deux réserves, valables quel que soit le dimensionnement :

- **Croissance du WAL.** `pg_wal` pèse 32 Mio pour 8 Mio de données. Le répertoire est pré-alloué
  (`min_wal_size` 80 Mio, `max_wal_size` 1 Gio) : prévoir le disque en conséquence, et surveiller un
  serveur qui importe beaucoup en une fois.
- **La base grossit linéairement en `audit_log`.** Le journal est plafonné à 500 événements par
  lecture d'écran mais n'est jamais purgé automatiquement ; 8.4 Mio pour 512 événements donne une
  idée de la densité, pas une prévision à long terme.

---

## 8. Aucune limite de ressources n'est déclarée

`docker-compose.yml` ne déclare **ni `mem_limit`, ni `cpus`**, sur aucun des trois services. Deux
conséquences concrètes :

- La colonne « mémoire » de `docker stats` affiche la RAM de l'hôte, pas un plafond du service. Un
  `70 MiB / 23.13 GiB` ne signifie pas « le service est plafonné à 70 Mio », cela veut dire
  « aucune limite n'est appliquée ».
- **Un service qui dérape n'est pas arrêté** : il consomme la mémoire de l'hôte jusqu'à ce que le
  noyau ou l'OOM killer tranche, ce qui emporte les trois services d'un coup.

Ajouter des limites (`mem_limit`, `cpus`) rend la consommation observable et borne la casse. Ce n'est
pas fait ici : les bonnes valeurs dépendent du serveur cible, et un `mem_limit` trop bas sur
PostgreSQL provoque un échec au démarrage plutôt qu'une dégradation progressive. À traiter au moment
du déploiement, avec les valeurs issues d'un `make resources` exécuté sur ce serveur.

---

## 9. Rejouer ces mesures

```bash
make docker-up                    # la stack doit être démarrée
make resources                    # relevé complet
./scripts/measure-usage.sh --images   # uniquement le poids disque
```

`make resources` appelle `scripts/measure-usage.sh`, qui produit le brut de ces sections : poids des
images dans les deux métriques, couches inscriptibles, taille du volume et des tables, RAM et CPU au
repos, processus par service, paramètres PostgreSQL, limites déclarées, occupation du store.

Le script inclut un **garde-fou** : il liste les répertoires de développement
(`node_modules`, `dist`, `.venv/build`) présents dans les images en service. Tout chiffre non nul
signale un `.dockerignore` trop laxiste — c'est ce contrôle qui a mis au jour les 220 Mo de
`node_modules` dans l'image de l'API (§10).

Le script ne crée ni n'arrête de conteneur : il lit l'état de la stack en cours.

---

## 10. Un défaut corrigé au cours de cette mesure

En mesurant le poids de l'image de l'API, `/app/src` pesait **222 Mio**, dont **220 Mio de
`src/FrontEnd/node_modules`** — des dépendances JavaScript dans une image qui n'exécute aucun
JavaScript. L'API pèserait 672 Kio de code réel (`/app/src/protab`).

**Cause.** Le `.dockerignore` racine contenait `node_modules/`. Docker n'ancre un motif qu'à la
**racine du contexte** : `node_modules/` exclut `./node_modules` mais laisse passer
`./src/FrontEnd/node_modules`. Vérifié par une image de test : avec `node_modules/` le fichier est
présent dans l'image, avec `**/node_modules/` il est exclu.

**Deux conséquences, dont une seule visible dans la taille de l'image :**

- Le contexte de build de l'API envoyait ~236 Mio au démon à chaque build, dont les 220 Mio en
  question — y compris sur les builds dont la couche finit ignorée par le cache.
- L'image finale les embarquait.

**Correction.** Tous les motifs imbriqués du `.dockerignore` racine sont préfixés par `**/`, avec un
commentaire qui explique la sémantique pour que la correction ne soit pas annulée au prochain
nettoyage.

**Gain mesuré** (`docker history`, somme des couches décompressées) :

| Image API      | Décompressée | Sur disque |
| -------------- | -----------: | ---------: |
| Avant          |     420.7 Mio| 100.6 Mio  |
| Après          |     188.8 Mio|  55.8 Mio  |

Soit **−232 Mio décompressés** et **−44.8 Mio sur disque**, sans aucune modification du `Dockerfile`.
Le garde-fou de `make resources` (§9) empêche la régression de revenir sans signal.

Le §3 de [`docker-architecture.md`](docker-architecture.md) décrivait l'image de l'API comme ne
contenant « ni `uv`, ni `node_modules`, ni les sources ». C'était exact pour `frontend` et faux pour
`api` ; le document a été corrigé.