import {
  CheckCircle2,
  FileText,
  OctagonX,
  Pencil,
  Plus,
  StickyNote,
  UploadCloud,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import type { AuditAction } from "../types";

/**
 * The seven audit actions, their French labels and their icons.
 *
 * Both maps are exhaustive `Record<AuditAction, …>`: adding a variant to the
 * union is a compile error here, so a new action cannot reach the table
 * without a label and an icon. The `<select>` of the filter bar is generated
 * from `ACTION_LABELS`, so it can never drift from the table that reads them.
 */
export const AUDIT_ACTIONS: { value: AuditAction; label: string }[] = [
  { value: "scope_created", label: "Création de périmètre" },
  { value: "scope_imported", label: "Import CSV" },
  { value: "activity_created", label: "Saisie d'activité" },
  { value: "activity_updated", label: "Modification d'activité" },
  { value: "activity_completed", label: "Validation d'activité" },
  { value: "activity_ko", label: "Journée signalée KO" },
  { value: "scope_note_updated", label: "Note du périmètre" },
  { value: "scope_officials_updated", label: "Responsables du périmètre" },
];

export const ACTION_LABELS: Record<AuditAction, string> = Object.fromEntries(
  AUDIT_ACTIONS.map(({ value, label }) => [value, label]),
) as Record<AuditAction, string>;

export const ACTION_ICONS: Record<AuditAction, LucideIcon> = {
  scope_created: Plus,
  scope_imported: UploadCloud,
  activity_created: FileText,
  activity_updated: Pencil,
  activity_completed: CheckCircle2,
  activity_ko: OctagonX,
  scope_note_updated: StickyNote,
  scope_officials_updated: UserCog,
};