import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock, OctagonX } from "lucide-react";

/**
 * Le statut d'une journée de périmètre, source unique côté front.
 *
 * Le même arbitrage que `nonWorkingDays.ts` et `routes.ts` : ce qui décide de
 * l'état d'une journée est écrit une seule fois. L'API expose `status` — un seul
 * champ, pas deux drapeaux — et les questions dérivées (`est traitée ?`,
 * `est terminée ?`, `est KO ?`) sont posées ici, pas recalculées à chaque
 * appelant. C'est aussi la seule façon de garder l'invariant le plus important
 * de l'écran : **un jour KO est traité**, sinon il compterait dans le bandeau
 * « N périmètres non traités » comme un travail en attente, alors que quelqu'un
 * est déjà passé dessus.
 */

/** Les trois états d'une journée — la même énumération que `DayStatus` côté API. */
export type DayStatus = "pending" | "completed" | "ko";

/** Longueur maximale du motif d'un KO, alignée sur la borne du domaine. */
export const KO_REASON_MAX_LENGTH = 500;

export const DAY_STATUS_LABELS: Record<DayStatus, string> = {
  pending: "À traiter",
  completed: "Terminée",
  ko: "KO",
};

export const DAY_STATUS_DESCRIPTIONS: Record<DayStatus, string> = {
  pending: "La journée n'a pas encore été traitée.",
  completed: "La journée a été traitée et validée.",
  ko: "Traitement impossible pour un problème technique : la journée est écartée du traitement en attente.",
};

export const DAY_STATUS_ICONS: Record<DayStatus, LucideIcon> = {
  pending: Clock,
  completed: CheckCircle2,
  ko: OctagonX,
};

/**
 * Un jour KO est traité : il a été regardé, et son blocage est connu.
 *
 * C'est tout l'intérêt du statut — sans cela, un périmètre bloqué par une panne
 * remonterait indéfiniment dans le bandeau des non traités.
 */
export function isHandled(status: DayStatus): boolean {
  return status !== "pending";
}

export function isCompleted(status: DayStatus): boolean {
  return status === "completed";
}

export function isKo(status: DayStatus): boolean {
  return status === "ko";
}

/** Un statut lu sans garantie de validité retombe sur `pending`, comme l'API. */
export function toDayStatus(value: unknown): DayStatus {
  return value === "completed" || value === "ko" ? value : "pending";
}