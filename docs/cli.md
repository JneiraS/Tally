# La CLI `protab-project`

`protab-project` est le point d'entrée de l'**administration d'hôte** : tout ce qui touche un projet
lui-même — sa création, son mot de passe, ses administrateurs. Elle demande la **base de données**, jamais
un cookie : c'est précisément ce qui en fait la seule voie d'accès quand un projet est verrouillé.

```bash
uv run protab-project --help    # inventaire des commandes
```

---

## 1. Ce que la CLI fait, et ce qu'elle ne fait pas

| Elle gère | Elle ne gère pas |
| --- | --- |
| La création d'un projet | Les périmètres (écran « Périmètres » ou import CSV) |
| Le mot de passe d'un projet | Les activités quotidiennes |
| Les administrateurs d'un projet | La lecture des données de production |
| | Le journal d'audit |

Le **projet** (le tenant) et le **quadrigramme** (la personne) sont deux notions distinctes. Un quadrigramme
n'existe que s'il est déclaré dans un périmètre — voir [§5](#5-qui-peut-se-connecter).

## 2. Prérequis

`DATABASE_URL` est **obligatoire**, sans exception. Elle est lue dans l'environnement puis dans le `.env`
(voir `.env.example`) :

```bash
export DATABASE_URL=postgresql://protab:protab@localhost:5432/protab
```

En stack Docker, le conteneur `api` la reçoit déjà de `docker-compose.yml` : rien à exporter. Voir
[§10](#10-en-docker).

Toutes les commandes se terminent par `SystemExit`, donc par un code de sortie non nul en cas d'erreur :
**2** pour une erreur d'usage (argument manquant, sous-commande mal orthographiée, aucun argument) et **1**
pour un refus métier (projet inconnu, dernier administrateur, quadrigramme refusé). `set-password` et la
forme positionnelle demandent le mot de passe au terminal, jamais en argument.

## 3. Inventaire des commandes

Le **projet vient toujours en premier**, y compris pour la forme historique.

| Commande | Effet | Écrit en base |
| --- | --- | --- |
| `protab-project <code> <nom> [--admin QUADRI]` | Crée un projet | `projects`, `project_admins` si `--admin` |
| `protab-project set-password <code>` | Remplace le mot de passe | `projects`, supprime les `auth_sessions` |
| `protab-project add-admin <code> <quadri>` | Autorise un quadrigramme | `project_admins` |
| `protab-project remove-admin <code> <quadri>` | Retire l'accès | `project_admins`, supprime les sessions |
| `protab-project list-admins <code>` | Liste les administrateurs | rien |

### Créer un projet

```bash
uv run protab-project projet-alpha "Projet Alpha" --admin MLOZ
# Mot de passe du projet :
# Projet créé : projet-alpha (Projet Alpha)
# Administrateur du projet : MLOZ
```

`--admin` est **optionnel et sans valeur par défaut**. Sans lui, la commande le signale et reste un
succès — la forme `protab-project <code> <nom>` est historique et doit continuer de fonctionner. Un projet
sans administrateur n'est pourtant pas anodin : voir [§6](#6-pourquoi-nommer-un-administrateur).

### Changer un mot de passe

```bash
uv run protab-project set-password projet-alpha
# Nouveau mot de passe du projet :
# Mot de passe mis à jour : projet-alpha
# Les sessions ouvertes avec l'ancien mot de passe ont été révoquées.
```

La révocation n'est pas cosmétique : c'est le geste à faire quand un mot de passe a été divulgué, sinon les
sessions déjà ouvertes survivraient à la rotation.

⚠️ Cette commande **ne vous tire pas d'un projet verrouillé** : elle ferme au lieu d'ouvrir.

## 4. Les mots de passe

Saisis par `getpass`, **jamais en argument** — les passer sur la ligne de commande les inscrit dans
l'historique du shell et dans la liste des processus.

`getpass` a besoin d'un **terminal**. C'est la contrainte la moins visible de la CLI :

- `docker compose exec` **avec** TTY : fonctionne (c'est le défaut, et ce qu'utilise `make project-admin`).
- `docker compose exec -T` : le mot de passe n'est plus masqué et la saisie échoue silencieusement.
- Pipe sur `getpass` : le terminal est perdu, un avertissement `GetPassWarning` est émis, l'écho revient.
  Prévu pour la CI, pas pour un usage humain.

Un mot de passe vide ou uniquement composé d'espaces est refusé : c'est une protection, pas un oubli.

## 5. Qui peut se connecter

Trois portes, dans cet ordre, pour un projet donné :

1. le **mot de passe** du projet — un seul, partagé par tous ses quadrigrammes ;
2. le **rôle d'administrateur** — le code est dans `project_admins` ;
3. les **officials d'un périmètre** — le code est dans `official_main` ou `official_backup`.

Les deux dernières sont un **union**, pas une alternative : nommer un administrateur ne retire rien aux
officials, et un quadrigramme déclaré dans un périmètre mais retiré comme administrateur continue d'entrer
par son périmètre.

Le mot de passe reste exigé dans tous les cas : un administrateur donne un accès permanent, **pas un accès
sans mot de passe**.

## 6. Pourquoi nommer un administrateur

Dès qu'un projet possède **un seul** périmètre, `authenticate()` refuse tout quadrigramme que ce périmètre
ne déclare pas. La fenêtre de démarrage (aucun périmètre = tout est accepté) se referme donc au premier
périmètre enregistré — et **la personne qui vient de l'enregistrer perd son accès**, sans aucun filet : ni
colonne « admin », ni liste d'administrateurs, ni mémorisation du premier quadrigramme.

Un administrateur est donc la garantie qu'un projet **reste ouvrable**. Nommez-en un dès la création :

```bash
uv run protab-project add-admin projet-alpha MLOZ
# Administrateur ajouté : MLOZ (projet-alpha)
```

### Ce qu'un administrateur n'est pas

- **Pas un rôle.** Une fois connecté, il a exactement les droits d'un officiel. Aucun accès particulier,
  aucun `403` de moins, aucun écran d'administration.
- **Pas global.** Un code administrateur du projet A n'ouvre **aucun** autre projet, même avec le bon mot de
  passe. `GET /projects` étant public, un code partagé ouvrirait tous les tenants de l'instance.
- **Pas un secret.** C'est une identité, comme un quadrigramme ; la protection reste le mot de passe.

### Ajouter, lister, retirer

```bash
uv run protab-project add-admin projet-alpha MRAM   # idempotent
# MRAM est déjà administrateur du projet projet-alpha.

uv run protab-project list-admins projet-alpha
# Administrateurs de projet-alpha :
#   - MLOZ
#   - MRAM

uv run protab-project remove-admin projet-alpha MRAM
# Administrateur retiré : MRAM (projet-alpha)
# Les sessions ouvertes avec ce quadrigramme ont été révoquées.
```

Trois garanties à connaître :

- **La casse et les espaces sont normalisés.** `mloz`, `MLOZ` et ` mloz ` désignent le même
  administrateur, comme à la connexion.
- **Un code que l'écran de connexion refuserait est rejeté à la porte.** `MLOZ/MRAM` (forme liste),
  `?` (substitut « pas de suppléant »), `A` ou un code de plus de 20 caractères sont refusés à la CLI
  comme dans l'adapter. Un administrateur que personne ne peut taper est un verrouillage présenté comme
  une autorisation.
- **La révocation ferme les sessions.** Comme `authenticate()` n'est appelé qu'au login, retirer
  l'administrateur sans fermer ses sessions le laisserait fonctionner 12 h.

### Le dernier administrateur est protégé

```bash
uv run protab-project remove-admin projet-alpha MLOZ
# MLOZ est le dernier administrateur de projet-alpha : le retirer laisserait le
# projet impossible à ouvrir si aucun périmètre ne déclare de quadrigramme. …
```

Le refus est délibéré : la commande existe justement pour empêcher le verrouillage, elle ne doit pas être
le geste qui le provoque. Deux sorties possibles — nommer un second administrateur, ou déclarer le
quadrigramme dans un périmètre (qui est alors ouvert par la porte n° 3). Le message affiche aussi la
commande SQL de contournement, pour le cas où vous savez ce que vous faites.

## 7. Erreurs et dépannage

| Message | Cause | Correction |
| --- | --- | --- |
| `DATABASE_URL est obligatoire.` | La variable n'est ni dans l'environnement ni dans le `.env` | `export DATABASE_URL=…`, ou passer par le conteneur `api` |
| `Projet inconnu : <code>` | Le code de projet n'existe pas, ou le projet est inactif | `list-admins` sur un projet connu pour en voir un ; `GET /projects` liste les projets actifs |
| `Le mot de passe du projet ne peut pas être vide.` | Saisie vide ou uniquement des espaces | Ressaisir ; c'est un refus volontaire, pas un bug |
| `Quadrigramme d'administrateur refusé (…)` | Code hors 2–20 caractères, sans alphanumérique, ou contenant `/` | Utiliser un quadrigramme simple, saisissable au login |
| `Le code, le nom et le mot de passe du projet sont obligatoires.` | Argument positionnel vide (`protab-project "" "Nom"`) | Vérifier les guillemets |
| `<quadri> n'est pas administrateur de <projet>` | Le code n'a jamais été ajouté, ou a déjà été retiré | `list-admins <projet>` pour voir qui l'est |
| `<quadri> est le dernier administrateur de <projet>` | Garde anti-verrouillage | Voir [§6](#le-dernier-administrateur-est-protégé) |
| `Le projet <code> existe déjà. Choisissez un autre code, ou utilisez set-password…` | Le code de projet est déjà pris | Changer de code, ou `set-password` si le projet existe déjà |
| `unrecognized arguments: …` | Sous-commande mal orthographiée (`add_admn`) | `protab-project --help` liste les cinq formes. Attention : la forme positionnelle Analyse aussi ces arguments, d'où ce message trompeur |

Le mot de passe est demandé **avant** l'écriture : une tentative de doublon n'est découverte qu'à l'insertion,
puisque c'est la contrainte d'unicité de la base qui fait foi. Saisissez donc le mot de passe avant de
voir « Le projet … existe déjà ».

## 8. Récupérer un projet verrouillé

Symptôme : personne ne peut se connecter, et chaque tentative renvoie « Projet, quadrigramme ou mot de
passe invalide » — un message qui ne distingue pas les trois causes.

**Ne lancez pas `set-password`.** Il remplace le hash et supprime toutes les sessions : le projet reste
verrouillé et vous perdez les sessions encore ouvertes.

1. **Trouvez le quadrigramme oublié.** Le journal d'audit conserve l'acteur de chaque action, et le tout
   premier enregistrement est généralement la création du premier périmètre :
   ```bash
   docker compose exec db psql -U protab -d protab -c \
     "SELECT DISTINCT actor, min(created_at) FROM audit_log
      WHERE project_id = '<projet>' GROUP BY actor;"
   ```
   Le login n'est pas audité : un quadrigramme qui s'est connecté puis n'a rien fait ne laisse aucune trace.

   Le filtre « intervenant » de l'écran Journal **ne sait pas lister** les acteurs : c'est une
   recherche par préfixe insensible à la casse, appliquée par le serveur. Il faut donc connaître au
   moins le début du code pour le trouver, et cette requête reste le seul moyen d'énumérer tous les
   acteurs d'un projet.

2. **Nommez-le administrateur.** Il n'a besoin d'être déclaré dans aucun périmètre :
   ```bash
   uv run protab-project add-admin <projet> <quadrigramme>
   ```

3. **Si le projet n'a aucun périmètre**, la fenêtre de démarrage est encore ouverte : n'importe quel
   quadrigramme entre, avec le bon mot de passe. Nommez un administrateur avant d'en créer un, sinon vous
   refermez la porte derrière vous.

4. **Si plus personne ne peut agir**, supprimez les périmètres du projet pour rouvrir la fenêtre, en
   sachant que cela efface aussi les activités qui y sont rattachées :
   ```bash
   docker compose exec db psql -U protab -d protab -c \
     "DELETE FROM scope_monitorings WHERE project_id = '<projet>';"
   ```
   C'est une perte de données : ne le faites que si les activités ont été
   exportées, et exportez-les d'abord. La cascade `ON DELETE CASCADE` supprime
   toutes les lignes `daily_activities` du projet.

## 9. Compléter un code de facturation manquant

Le code de facturation (`scope_monitorings.billing_code`) est **obligatoire à la
création** d'un périmètre, mais la colonne est nullable : les périmètres
enregistrés avant son introduction l'ont vide, et l'interface l'affiche « — ».
Il n'existe aucune route de mise à jour du code de facturation — `PATCH
/scope-monitorings/{id}` ne modifie que la note du périmètre, depuis l'interface —
donc la reprise passe par SQL.

```bash
# Périmètres sans code, tous projets confondus
docker compose exec db psql -U protab -d protab -c \
  "SELECT id, project_id, name FROM scope_monitorings
   WHERE billing_code IS NULL ORDER BY project_id, name;"

# Renseignement
docker compose exec db psql -U protab -d protab -c \
  "UPDATE scope_monitorings SET billing_code = 'FACT-2026-PAI'
   WHERE id = '<uuid>';"
```

Le format est libre (la seule règle est non vide, et il est `strip`é) et le code
n'est **pas unique** : deux périmètres peuvent partager le même code de
facturation.

⚠️ Ces écritures sont directes et **ne passent pas par le journal d'audit**, qui
ne connaît que les use cases. Exportez avant, si la traçabilité importe.

## 10. En Docker

Le conteneur `api` reçoit `DATABASE_URL` par `docker-compose.yml` : la CLI y fonctionne directement.

```bash
make docker-up                                    # la stack doit tourner
make project-admin ARGS="list-admins protab"      # forme courte
docker compose exec api protab-project add-admin protab MLOZ   # forme explicite
```

`make project-admin` est un simple relais vers `docker compose exec api protab-project $(ARGS)`. La cible
n'a volontairement **aucune dépendance** : y mettre `docker-up` déclencherait une reconstruction complète de
la stack à chaque appel d'administration. La stack doit être démarrée au préalable.

⚠️ **N'ajoutez pas `-T`.** Sans terminal, la saisie du mot de passe échoue — voir [§4](#4-les-mots-de-passe).

Dans un conteneur, `protab-project` crée aussi le projet bootstrap s'il est absent, et lira alors
`PROTAB_DEFAULT_PROJECT_PASSWORD` et `PROTAB_DEFAULT_PROJECT_ADMIN_CODE`. Ces deux variables ne sont
lues qu'à la création : une installation déjà initialisée redémarre sans elles.

## 11. Voir aussi

- `README.md` § « Authentification par projet » — le modèle d'authentification et les invariants
- `AGENTS.md` §28.3 et §28.3 bis — pourquoi ces règles existent
- `docs/architecture.md` §9 — pourquoi `billing_code` est nullable en base
- `make help` — les cibles Makefile disponibles
