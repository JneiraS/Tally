/**
 * Utilitaires pour la manipulation et l'affichage des dates ISO YYYY-MM-DD.
 * Évite les décalages de fuseau horaire en manipulant directement les composants année/mois/jour.
 */

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Vérifie si une chaîne correspond au format strict YYYY-MM-DD et correspond à une date réelle.
 */
export function isValidIsoDate(str: string): boolean {
  if (!ISO_DATE_REGEX.test(str)) return false;
  const [yearStr, monthStr, dayStr] = str.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

/**
 * Retourne la date courante au format "YYYY-MM-DD".
 */
export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Ajoute un nombre donné de jours à une date ISO, en évitant les décalages de fuseau horaire.
 */
export function addDaysIso(isoDate: string, days: number): string {
  if (!isValidIsoDate(isoDate)) return isoDate;
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * Formate une date YYYY-MM-DD en format français standard (ex: "19 sept. 2026").
 */
export function formatDateFr(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) return isoDate;
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formate une date YYYY-MM-DD en format complet (ex: "Samedi 19 septembre 2026").
 */
export function formatFullDateFr(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) return isoDate;
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
  
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Compare deux dates YYYY-MM-DD (ordre antichronologique par défaut: plus récent en premier).
 */
export function compareIsoDatesDesc(a: string, b: string): number {
  return b.localeCompare(a);
}

/**
 * Convertit une date ISO en instant ISO du **début de la journée locale**.
 *
 * Le journal d'audit filtre le serveur, qui ne connaît aucun fuseau : les
 * bornes d'une journée doivent donc être résolues ici, dans le fuseau du
 * navigateur — celui qui affiche déjà les horodatages du journal et qui
 * indexe les lignes de la heatmap (§28.6). C'est aussi le seul choix qui
 * afficherait « 19 septembre » de part et d'autre de l'écran.
 *
 * `new Date("2026-09-19")` aurait été interprété en UTC, donc décalé d'un jour
 * à l'heure d'été : la date est décomposée puis reconstruite en heure locale,
 * comme le fait `addDaysIso` ci-dessus.
 *
 * Une zone qui décale son minimuit (changement d'heure à 00 h) fait avancer
 * l'instant d'une heure plutôt que de renvoyer une date invalide ; la journée
 * demandée reste alors couverte, simplement depuis son premier instant réel.
 */
export function isoDateToLocalDayStart(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) return "";
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  return new Date(
    parseInt(yearStr, 10),
    parseInt(monthStr, 10) - 1,
    parseInt(dayStr, 10)
  ).toISOString();
}

/**
 * Convertit une date ISO en instant ISO du **début du lendemain local**.
 *
 * C'est la borne haute d'une journée, et elle est **exclusive** côté serveur :
 * `from` inclusif + `to` exclusif est la seule façon d-dire « toute cette
 * journée » sans arrondi à la seconde près. Une borne haute à 23:59:59
 * exclurait la dernière seconde, et une à 23:59:59.999 dépendrait de la
 * précision d'horloge de la base.
 */
export function isoDateToNextLocalDayStart(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) return "";
  return isoDateToLocalDayStart(addDaysIso(isoDate, 1));
}
