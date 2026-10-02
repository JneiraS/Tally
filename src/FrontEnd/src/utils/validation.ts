/**
 * Règles métier et validations UI pour ProTab
 */

/**
 * Une référence FEAI est un code `INC` suivi de 9 chiffres, précédé d'un
 * préfixe facultatif de 2 à 5 lettres : `FE-INC000000001`. Le préfixe est
 * générique et non unique — `FE`, `FEAI` ou `FEP` désignent la même famille.
 */
export const FEAI_REGEX = /^(?:[A-Z]{2,5}-)?INC\d{9}$/;

/** Longueur de la forme canonique la plus longue : `FEAI-` (5) + `INC` + 9 chiffres. */
export const FEAI_MAX_LENGTH = 18;

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
  billing_code?: string;
  general?: string;
}

/**
 * Ramène une référence à sa forme canonique : séparateurs (espace, tiret,
 * slash) réduits à un tiret unique, et tiret ajouté à un préfixe collé au
 * code. La casse n'est pas touchée : elle est déjà normalisée à la saisie.
 */
export function normalizeFeai(value: string): string {
  return value
    .trim()
    .replace(/[\s\-/]+/g, '-')
    .replace(/^([A-Z]{2,5})-?(INC)/, '$1-$2');
}

/**
 * Valide un identifiant FEAI (ex: "INC000000001" ou "FE-INC000000001").
 */
export function isValidFeai(value: string): boolean {
  return FEAI_REGEX.test(normalizeFeai(value));
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

  // Validation FEAI : le doublon se juge sur la forme canonique, sinon la
  // même référence passerait deux fois selon la séparatrice tapée.
  const cleanedFeai = data.feai.map((item) => normalizeFeai(item));
  const seenFeai = new Set<string>();

  cleanedFeai.forEach((code, idx) => {
    if (code === '') {
      feaiItemErrors[idx] = 'Le numéro FEAI ne peut pas être vide.';
    } else if (!isValidFeai(code)) {
      feaiItemErrors[idx] =
        'Format attendu : INC suivi de 9 chiffres, précédé d\'un préfixe facultatif de 2 à 5 lettres (ex: FE-INC000000001).';
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
  billing_code: string;
}): { isValid: boolean; errors: ScopeValidationErrors } {
  const errors: ScopeValidationErrors = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Le nom du périmètre est obligatoire.';
  }

  if (!data.knowledge_base_id || data.knowledge_base_id.trim() === '') {
    errors.knowledge_base_id = 'L\'identifiant de base de connaissances est obligatoire.';
  } else if (data.knowledge_base_id.trim().length < 9) {
    errors.knowledge_base_id = `L'identifiant doit comporter au moins 9 caractères (actuellement : ${data.knowledge_base_id.trim().length}).`;
  }

  if (!data.official_main || data.official_main.trim() === '') {
    errors.official_main = 'Le responsable principal est obligatoire.';
  }

  if (!data.official_backup || data.official_backup.trim() === '') {
    errors.official_backup = 'Le responsable suppléant est obligatoire.';
  }

  if (!data.billing_code || data.billing_code.trim() === '') {
    errors.billing_code = 'Le code de facturation est obligatoire.';
  }

  const isValid =
    !errors.name &&
    !errors.knowledge_base_id &&
    !errors.official_main &&
    !errors.official_backup &&
    !errors.billing_code;

  return { isValid, errors };
}
