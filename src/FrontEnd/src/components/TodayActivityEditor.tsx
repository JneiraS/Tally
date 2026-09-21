import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { DailyActivity } from "../types";
import { protabApi, ApiError } from "../services/api";
import { validateActivityForm } from "../utils/validation";
import { FeaiTagInput } from "./FeaiTagInput";

const DEBOUNCE_MS = 800;

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface TodayActivityEditorProps {
  scopeId: string;
  day: string;
  initialActivity?: DailyActivity | null;
  onChanged?: (scopeId: string, activity: DailyActivity) => void;
}

interface ValueSnapshot {
  errorsReported: string;
  incidentsCreated: string;
  feai: string[];
}

export function TodayActivityEditor({
  scopeId,
  day,
  initialActivity,
  onChanged,
}: TodayActivityEditorProps) {
  const [errorsReported, setErrorsReported] = useState<string>(
    String(initialActivity?.errors_reported ?? 0),
  );
  const [incidentsCreated, setIncidentsCreated] = useState<string>(
    String(initialActivity?.incidents_created ?? 0),
  );
  const [feai, setFeai] = useState<string[]>(initialActivity?.feai ?? []);
  const [status, setStatus] = useState<SaveStatus>(
    initialActivity ? "saved" : "idle",
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const valuesRef = useRef<ValueSnapshot>({
    errorsReported,
    incidentsCreated,
    feai,
  });
  valuesRef.current = { errorsReported, incidentsCreated, feai };

  const existsRef = useRef<boolean>(!!initialActivity);
  const lastSavedRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef<boolean>(false);
  const needsSaveRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  const snapshot = (): string => JSON.stringify(valuesRef.current);

  // Snapshot initial des valeurs déjà persistées côté serveur
  if (lastSavedRef.current === "") {
    lastSavedRef.current = snapshot();
  }

  const doSave = async (): Promise<void> => {
    const values = valuesRef.current;

    const normalized = validateActivityForm(
      {
        day,
        errors_reported: values.errorsReported,
        incidents_created: values.incidentsCreated,
        feai: values.feai,
      },
      { isCreation: false },
    );

    if (!normalized.isValid) {
      return;
    }

    if (savingRef.current) {
      needsSaveRef.current = true;
      return;
    }

    if (!mountedRef.current) return;
    setStatus("saving");

    const payload = {
      errors_reported: Number(values.errorsReported),
      incidents_created: Number(values.incidentsCreated),
      feai: values.feai,
    };

    savingRef.current = true;
    try {
      if (existsRef.current) {
        await protabApi.updateActivity(scopeId, day, payload);
      } else {
        try {
          await protabApi.createActivity(scopeId, { day, ...payload });
          existsRef.current = true;
        } catch (err) {
          // Deux sources pourraient créer le même jour : basculer en PATCH puis réessayer
          if (err instanceof ApiError && err.status === 409) {
            existsRef.current = true;
            await protabApi.updateActivity(scopeId, day, payload);
          } else {
            throw err;
          }
        }
      }

      lastSavedRef.current = snapshot();

      if (mountedRef.current) {
        setSaveError(null);
        setStatus(needsSaveRef.current ? "dirty" : "saved");
        onChanged?.(scopeId, {
          day,
          errors_reported: payload.errors_reported,
          incidents_created: payload.incidents_created,
          feai: payload.feai,
          handled: initialActivity?.handled ?? false,
          completed: initialActivity?.completed ?? false,
        });
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        setSaveError(
          err instanceof ApiError
            ? err.message
            : (err as Error)?.message || "Échec de la sauvegarde.",
        );
        setStatus("error");
      }
    } finally {
      savingRef.current = false;
      const pending = needsSaveRef.current;
      needsSaveRef.current = false;
      if (pending) {
        void doSave();
      }
    }
  };

  const performSaveRef = useRef<() => Promise<void>>(async () => {});
  performSaveRef.current = () => doSave();

  const scheduleSave = () => {
    setSaveError(null);
    setStatus("dirty");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void doSave();
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      // Flush de la dernière modification en attente
      if (lastSavedRef.current !== snapshot()) {
        void performSaveRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation temps réel pour le retour visuel
  const validation = useMemo(
    () =>
      validateActivityForm(
        {
          day,
          errors_reported: errorsReported,
          incidents_created: incidentsCreated,
          feai,
        },
        { isCreation: false },
      ),
    [day, errorsReported, incidentsCreated, feai],
  );

  const isValidLive = validation.isValid;
  const isDirty =
    status === "dirty" ||
    status === "saving" ||
    lastSavedRef.current !== snapshot();

  const statusLabel = {
    idle: "En attente de saisie",
    dirty: "Enregistrement…",
    saving: "Enregistrement…",
    saved: "Enregistré",
    error: "Erreur",
  }[status];

  return (
    <div className="flex flex-col gap-1.5 min-w-[240px] text-left">
      {/* Compteurs erreurs / incidents */}
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-slate-500 dark:text-nord-4 uppercase tracking-wider">
            Erreurs
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={errorsReported}
            onChange={(e) => {
              setErrorsReported(e.target.value);
              scheduleSave();
            }}
            aria-label="Erreurs signalées du jour"
            className={`w-full px-2 py-1 text-xs text-center font-semibold bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded focus:outline-none focus:ring-1 transition-all ${
              validation.errors.errors_reported
                ? "border-rose-300 dark:border-nord-11/50 focus:ring-rose-500"
                : "border-slate-200 dark:border-nord-2 focus:border-blue-500 dark:focus:border-nord-8"
            }`}
          />
        </label>

        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-slate-500 dark:text-nord-4 uppercase tracking-wider">
            Incidents
          </span>
          <input
            type="number"
            min="0"
            max={Number(errorsReported) || undefined}
            step="1"
            value={incidentsCreated}
            onChange={(e) => {
              setIncidentsCreated(e.target.value);
              scheduleSave();
            }}
            aria-label="Incidents créés aujourd'hui"
            className={`w-full px-2 py-1 text-xs text-center font-semibold bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded focus:outline-none focus:ring-1 transition-all ${
              validation.errors.incidents_created
                ? "border-rose-300 dark:border-nord-11/50 focus:ring-rose-500"
                : "border-slate-200 dark:border-nord-2 focus:border-blue-500 dark:focus:border-nord-8"
            }`}
          />
        </label>
      </div>

      {/* Références FEAI */}
      <FeaiTagInput
        values={feai}
        onChange={(next) => {
          setFeai(next);
          scheduleSave();
        }}
        errorMessage={validation.errors.feai}
      />

      {/* Statut d'enregistrement */}
      <div className="flex items-center gap-1.5 min-h-4">
        {status === "saving" && (
          <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-nord-8">
            <Loader2 className="w-3 h-3 animate-spin" />
            {statusLabel}
          </span>
        )}
        {status === "saved" && !isDirty && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-nord-14">
            <CheckCircle2 className="w-3 h-3" />
            {statusLabel}
          </span>
        )}
        {status !== "saved" && status !== "saving" && !isValidLive && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-nord-13">
            <AlertTriangle className="w-3 h-3" />
            {validation.errors.incidents_created &&
            !validation.errors.errors_reported
              ? "Incidents ≤ erreurs"
              : "Valeurs invalides"}
          </span>
        )}
        {status === "error" && saveError && (
          <span
            className="text-[10px] text-rose-600 dark:text-nord-11 line-clamp-1"
            title={saveError}
          >
            {saveError}
          </span>
        )}
      </div>
    </div>
  );
}
