# Tally plutôt qu'un tableur

Tally tient, pour chaque service, un registre unique de production : une ligne par périmètre de
supervision et par jour, avec les erreurs relevées, les incidents créés et les références associées.

Cette note explique pourquoi cet outil remplace avantageusement les tableurs de production, et
sciemment dans quel cas il ne le remplace pas. Elle s'adresse aux responsables de service et n'a
pas vocation à décrire le fonctionnement technique du logiciel.

## Ce que coûte un tableur partagé

Un tableur de production semble fonctionner au début : une feuille, quelques colonnes, une mise en forme.
Les difficultés apparaissent dès qu'une deuxième personne intervient.

- **Les copies s'accumulent.** `production_final.xlsx`, `production_final_bis.xlsx`,
  `production_final_v3_corrigée.xlsx` : plus personne ne sait lequel fait foi, et la consolidation
  devient un copier-coller manuel à chaque période.
- **Une modification ne laisse pas de trace.** Une cellule corrigée est corrigée, silencieusement.
  Ni qui, ni quand, ni ce qui a changé. Le tableur conserve un historique de fichier, pas un
  historique de décision.
- **Les données se désynchronisent.** Deux services travaillent chacun sur leur version ; les totaux
  ne correspondent plus, et il faut les réconcilier à la main avant tout reporting.
- **Le copier-coller casse silencieusement.** Une colonne insérée, une ligne décalée, un format de
  date différent : le tableur accepte l'anomalie, et le défaut n'apparaît qu'au moment de l'agréger.
- **L'accès passe par le partage du fichier.** Un dossier réseau ouvert, un lien transmis par
  courriel : l'accès suit le partage du fichier, pas une règle établie. Le mot de passe posé sur un
  tableur protège peu : il suffit de le contourner par une copie.

## Ce que Tally change

**1. Un seul registre par service.** Chaque service saisit dans un registre unique, en ligne, sans
copie ni version bis. La question « quel fichier est le bon ? » n'a plus lieu d'être.

**2. Plusieurs services, aucune confusion.** Les services partagent l'application, jamais leurs
données : aucun service ne voit les périmètres d'un autre, y compris quand un périmètre porte
exactement le même nom. La séparation est appliquée par l'outil, pas par une convention.

**3. Plus d'écrasement entre collègues.** Corriger la journée d'un périmètre ne réécrit que cette
journée. Si un collègue a saisi entre-temps les autres jours de la semaine, ces jours restent
intacts. Dans un tableur, une correction impose de renvoyer le fichier entier, donc d'écraser le
travail de l'autre.

**4. Une journée ne peut être comptée qu'une fois.** Pour un périmètre donné, une seule journée existe.
Un doublon de saisie — la cause la plus fréquente d'un gonflement des totaux — est refusé.

**5. Les incohérences sont refusées à la saisie.** Le nombre d'incidents ne peut pas dépasser le
nombre d'erreurs du même jour ; une référence mal formée est rejetée ; un doublon de référence est
signalé. Le registre ne peut donc pas contenir de total faux : l'erreur est visible à la saisie,
pas trois mois plus tard en fin de période.

**6. Chaque modification est attribuée et datée.** Qui a modifié quoi, quel jour, et quel changement :
c'est consultable, et filtrable par périmètre, par personne, par type d'action et par période. Le
journal vit dans les données, il ne dépend pas d'une fonction d'historique d'un poste de travail.

**7. Chaque service garde la main sur ses données.** Chaque service dispose de son propre mot de passe.
Le changer ferme immédiatement toutes les sessions ouvertes : c'est le geste correct lorsqu'un mot de
passe a été transmis, et il n'est pas jouable avec un fichier. Aucun mot de passe n'est partagé entre
services.

**8. Un import échoue entièrement plutôt que de corrompre.** La création en masse depuis un fichier
contrôle sa structure avant d'écrire : si une ligne est invalide, **rien** n'est créé. Un
copier-coller partiel, lui, laisse un mélange de bonnes et de mauvaises lignes, sans signal.

**9. Des indicateurs toujours à jour.** Taux de transformation, reliquat d'erreurs, écart à la
référence, taux de couverture, tendance quotidienne et cumulée : ces indicateurs sont calculés à
partir des données saisies, jamais recopiés d'une feuille. Aucun total divergent n'est possible,
puisqu'il n'y a qu'une donnée à l'origine.

**10. Les jours ouvrés sont définis par service.** Un week-end, un pont, une période de congés : la
liste est paramétrée, et l'outil se place par défaut sur la dernière journée ouvrée. Dans un tableur,
ces exceptions sont des formules à maintenir, et la première saisie après un pont se fait sur une
mauvaise date.

**11. Une extraction propre pour le reporting.** Export CSV ou JSON sur une période choisie, dans un
format stable et lisible par les autres outils. Le reporting devient une extraction, au lieu d'une
reconstruction manuelle de fichiers.

**12. L'outil évolue sans imposer de refaire les données.** Les règles de saisie, les écrans et les
indicateurs progressent sans que les données saisies soient ressaisies. Un tableur, lui, se
dégrade : chaque nouvelle colonne demandée se traduit par une nouvelle version, et les anciennes
versions restent en circulation.

## Ce qu'un tableur fait mieux

Il serait malhonnête de le cacher : dans son domaine, le tableur reste plus simple.

- **Le travail hors ligne.** Un tableur s'ouvre sans réseau. Tally suppose l'accès au service, ce qui
  rend impossible une saisie sur un poste isolé ou sans connexion.
- **La liberté de calcul.** Un tableur permet n'importe quel calcul improvisé, y compris une
  exploration de dernière minute. Tally ne calcule que ce qu'il sait faire.
- **L'absence d'exploitation.** Aucun serveur à maintenir, aucune sauvegarde à organiser, aucune
  mise à jour. Pour un besoin léger, le coût total d'un tableur est nul.
- **L'universalité de lecture.** Tout le monde sait ouvrir un tableur, sans formation. La familiarité
  de l'interface n'a pas d'équivalent.
- **La souplesse de l'arbitrage.** Un tableur se modifie en deux minutes, y compris par la personne
  qui ne maîtrise pas l'outil. Tally demande de passer par les règles de l'application.

## Quand ne pas migrer

Il est légitime de garder un tableur, et notamment :

- **un besoin ponctuel et faible volume**, confié à une ou deux personnes, sans réutilisation
  quotidienne : la mise en place d'un outil partagé serait disproportionnée ;
- **des calculs libres non modélisables** : scénarios « et si », modèles financiers complexes,
  simulations, tout ce qui relève de l'exploration plutôt que du suivi ;
- **un contexte sans accès fiable au service**, où la saisie doit rester possible quoi qu'il arrive ;
- **l'absence de référent** : Tally a besoin d'un propriétaire technique et d'un remplacement
  documenté. Sans cette garantie, l'outil se dégrade en quelques mois — exactement comme un tableur.

Dans ces cas, Tally peut tout de même être utile comme registre de référence, l'export CSV
permettant de produire le tableur dérivé à la demande.

## En résumé

Tally n'est pas « un tableur avec une interface plus jolie » : il remplace le fichier par un registre
partagé, borné, tracé et contrôlé, ce qui supprime les trois coûts durables d'un tableur de
production — la consolidation manuelle, la perte de traçabilité, et le risque de données incohérentes.

Si le service concerné dépasse quelques périmètres et fait l'objet d'un reporting régulier, le
report du tableur vers Tally supprime une charge récurrente plutôt qu'il ne la déplace.
