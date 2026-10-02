# Tally plutôt qu'un tableur de production

Tally tient, pour chaque service, un registre unique de production : une ligne par périmètre de supervision et par jour, avec les erreurs relevées, les incidents créés et les références associées.

Cette note explique pourquoi Tally remplace avantageusement un tableur pour le suivi d'activité — même à l'ère des tableurs partagés en ligne (Microsoft Excel Web, Google Sheets) — et précise sciemment dans quels cas le tableur reste préférable. Elle s'adresse aux responsables de service et présente les enjeux de gestion sans détailler le fonctionnement technique.

---

## Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais

Les tableurs partagés modernes ont corrigé les défauts historiques du fichier local : le document est unique, la co-édition se fait en temps réel et l'historique des versions garde une trace des modifications.

En revanche, un tableur partagé demeure une « feuille blanche » sans règles métier appliquées. C'est là que naissent les coûts cachés en production :

- **Le copier-coller contourne la validation.** Même avec des listes déroulantes ou du typage, un copier-coller depuis une autre source écrase les règles de validation, masque les incohérences et décale les colonnes sans avertissement.
- **Les règles métier ne sont pas appliquées.** Un tableur accepte qu'on saisisse 10 incidents pour 2 erreurs relevées. Il accepte deux fois la même journée pour un même périmètre ou une référence mal formée. L'anomalie n'apparaît qu'au moment d'agréger ou de présenter les chiffres.
- **Les formules restent fragiles.** Une ligne insérée, une cellule glissée ou un filtre mal appliqué peut fausser un total de synthèse silencieusement. La consolidation repose sur la vigilance des saisisseurs, pas sur l'outil.
- **Le cloisonnement des données est difficile.** Dans un tableur partagé, accéder à la feuille donne souvent accès à la totalité des lignes. Masquer ou protéger des onglets par service reste complexe, fragile et lourd à maintenir.
- **Les imports partiels corrompent le registre.** Si un utilisateur colle un bloc de 50 lignes dont la 30ᵉ contient une anomalie, le tableur valide l'ensemble. Il laisse un mélange de données correctes et erronées sans aucun signalement.

---

## Ce que Tally apporte

**1. Des contrôles stricts dès la saisie.** Le nombre d'incidents ne peut pas dépasser le nombre d'erreurs ; une référence mal formée est rejetée ; un doublon de référence est immédiatement signalé. Le registre ne peut contenir aucun total faux.

**2. L'impossibilité d'isoler des doublons.** Pour un périmètre et une date donnés, une seule saisie est autorisée. La cause principale du gonflement artificiel des indicateurs en fin de période est éliminée à la source.

**3. Un cloisonnement étanche entre services.** Tous les services utilisent la même application, mais aucun ne voit les périmètres ni les données d'un autre — même si deux périmètres portent le même nom. La sécurité est garantie par l'outil, sans dépendre de droits d'accès sur des onglets.

**4. Un journal d'audit métier.** Tally ne conserve pas seulement l'historique d'une cellule : il enregistre **qui** a modifié **quel périmètre**, **quelle journée** et **quel type d'action** a été réalisé. Ce journal est directement consultable et filtrable par période ou par intervenant.

**5. Des imports totalement sécurisés.** Lors de la création en masse à partir d'un fichier, Tally valide l'intégralité de la structure avant d'écrire. Si une seule ligne est invalide, **rien n'est importé**.

**6. Des indicateurs calculés à la source.** Taux de transformation, reliquat d'erreurs, écart à la référence, taux de couverture, tendances quotidiennes et cumulées : tous ces indicateurs sont calculés en temps réel à partir du registre central. Aucun écart de formule ou total divergent n'est possible.

**7. Un paramétrage propre des jours ouvrés.** Week-ends, jours fériés et ponts sont configurés par service. Par défaut, l'interface se positionne sur la dernière journée ouvrée réelle pour éviter toute erreur de date au retour d'un week-end prolongé.

**8. Des extractions fiables pour le reporting.** Les données s'exportent en CSV ou JSON sur la période choisie dans un format stable, directement exploitable par vos outils de BI ou de présentation, sans nettoyage préalable.

**9. Des évolutions sans régression.** Les règles de contrôle, les indicateurs et l'interface évoluent au niveau central sans risquer de dégrader l'historique ni d'imposer la refonte de modèles de feuilles.

---

## Ce qu'un tableur continue de mieux faire

Le tableur conserve des atouts imbattables dans son domaine d'excellence :

- **Le travail hors ligne :** Un tableur s'ouvre sans connexion réseau, alors que Tally nécessite un accès au service web.
- **La liberté d’exploration :** Un tableur permet d'improviser des calculs ad hoc, des simulations ou des graphiques sur mesure. Tally se concentre exclusivement sur les indicateurs de production modélisés.
- **L'absence d'infrastructure :** Aucun serveur ni composant applicatif à administrer pour un besoin très ponctuel.
- **La prise en main immédiate :** L'interface d'un tableur est familière pour l'ensemble des équipes sans nécessiter la moindre présentation.

---

## Quand conserver le tableur ?

Il reste pertinent de privilégier le tableur dans les configurations suivantes :

- **Volume faible ou besoin ponctuel :** Une activité suivie par une ou deux personnes sans consolidation ni réutilisation quotidienne.
- **Analyses prospectives et scénarios :** Modélisations financières, simulations « et si » ou travaux de recherche.
- **Saisie en environnement déconnecté :** Postes isolés du réseau ou déplacements hors couverture.
- **Absence de gouvernance applicative :** Tally nécessite un propriétaire applicatif identifié. Sans responsable pour gérer les périmètres et l'accès des utilisateurs, l'outil perd en efficacité.

Dans ces cas d'usage, Tally peut néanmoins servir de registre source central, dont l'export CSV alimente les tableurs d'analyse ad hoc.

---

## En résumé

Tally ne cherche pas à remplacer le tableur pour l'analyse ou l'exploration de données. Il remplace la « feuille de calcul libre » par un **registre applicatif contrôlé et tracé**.

Pour un service qui gère plusieurs périmètres et produit un reporting régulier, passer d'un tableur partagé à Tally garantit l'exactitude des chiffres à la source et supprime définitivement le temps passé à vérifier, corriger et réconcilier les données.
