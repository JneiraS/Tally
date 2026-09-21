/**
 * Règles métier et validations UI pour ProTab
 */

export const FEAI_REGEX = /^INC\d{9}$/;

export interface ActivityValidationErrors {
  day?: string;
  errors_reported?: string;
  incidents_created?: string;
  feai?: string;
  feai_items?: Record<number, string>;
  general?: string;
}

export interface ScopeValidationErrors {
  name?: string;
  knowledge_base_id?: string;
  official_main?: string;
  official_backup?: string;
  general?: string;
}

/**
 * Valide le format d'un identifiant FEAI (ex: "INC000000001")
 */
export function isValidFeai(value: string): boolean {
  return FEAI_REGEX.test(value.trim());
}

/**
 * Valide les données de formulaire d'activité quotidienne
 */
export function validateActivityForm(
  data: {
    day?: string;
    errors_reported: number | string;
    incidents_created: number | string;
    feai: string[];
  },
  options?: {
    isCreation?: boolean;
    existingDays?: string[];
  }
): { isValid: boolean; errors: ActivityValidationErrors } {
  const errors: ActivityValidationErrors = {};
  const feaiItemErrors: Record<number, string> = {};

  // Validation de la date en création
  if (options?.isCreation) {
    if (!data.day || data.day.trim() === '') {
      errors.day = 'Veuillez sélectionner une date.';
    } else if (options.existingDays && options.existingDays.includes(data.day)) {
      errors.day = `Une activité existe déjà pour le ${data.day}. Une seule activité est autorisée par jour.`;
    }
  }

  // Conversion en nombres
  const errorsReported = Number(data.errors_reported);
  const incidentsCreated = Number(data.incidents_created);

  if (isNaN(errorsReported) || errorsReported < 0 || !Number.isInteger(errorsReported)) {
    errors.errors_reported = 'Le nombre d\'erreurs signalées doit être un entier positif ou nul (≥ 0).';
  }

  if (isNaN(incidentsCreated) || incidentsCreated < 0 || !Number.isInteger(incidentsCreated)) {
    errors.incidents_created = 'Le nombre d\'incidents créés doit être un entier positif ou nul (≥ 0).';
  } else if (!isNaN(errorsReported) && errorsReported >= 0 && incidentsCreated > errorsReported) {
    errors.incidents_created = `Le nombre d'incidents (${incidentsCreated}) ne peut pas dépasser le nombre d'erreurs (${errorsReported}).`;
  }

  // Validation FEAI
  const cleanedFeai = data.feai.map((item) => item.trim());
  const seenFeai = new Set<string>();

  cleanedFeai.forEach((code, idx) => {
    if (code === '') {
      feaiItemErrors[idx] = 'Le numéro FEAI ne peut pas être vide.';
    } else if (!isValidFeai(code)) {
      feaiItemErrors[idx] = 'Format attendu : INC suivi de 9 chiffres (ex: INC000000001).';
    } else if (seenFeai.has(code)) {
      feaiItemErrors[idx] = `Référence en doublon : "${code}". Chaque référence doit être unique.`;
    } else {
      seenFeai.add(code);
    }
  });

  if (Object.keys(feaiItemErrors).length > 0) {
    errors.feai_items = feaiItemErrors;
    errors.feai = 'Certaines références FEAI sont invalides ou en doublon.';
  }

  const isValid =
    !errors.day &&
    !errors.errors_reported &&
    !errors.incidents_created &&
    !errors.feai;

  return { isValid, errors };
}

/**
 * Valide les données d'un périmètre de supervision
 */
export function validateScopeForm(data: {
  name: string;
  knowledge_base_id: string;
  official_main: string;
  official_backup: string;
}): { isValid: boolean; errors: ScopeValidationErrors } {
  const errors: ScopeValidationErrors = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Le nom du périmètre est obligatoire.';
  }

  if (!data.knowledge_base_id || data.knowledge_base_id.trim() === '') {
    errors.knowledge_base_id = 'L\'identifiant de base de connaissances est obligatoire.';
  } else if (data.knowledge_base_id.trim().length < 10) {
    errors.knowledge_base_id = `L'identifiant doit comporter au moins 10 caractères (actuellement : ${data.knowledge_base_id.trim().length}).`;
  }

  if (!data.official_main || data.official_main.trim() === '') {
    errors.official_main = 'Le responsable principal est obligatoire.';
  }

  if (!data.official_backup || data.official_backup.trim() === '') {
    errors.official_backup = 'Le responsable suppléant est obligatoire.';
  }

  const isValid =
    !errors.name &&
    !errors.knowledge_base_id &&
    !errors.official_main &&
    !errors.official_backup;

  return { isValid, errors };
}
