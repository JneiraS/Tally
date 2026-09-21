import { useState } from "react";
import { X, Plus, CheckCircle2 } from "lucide-react";
import { isValidFeai } from "../utils/validation";

interface FeaiTagInputProps {
  values: string[];
  onChange: (next: string[]) => void;
  errorMessage?: string;
}

export function FeaiTagInput({
  values,
  onChange,
  errorMessage,
}: FeaiTagInputProps) {
  const [draft, setDraft] = useState("");
  const [itemError, setItemError] = useState<string | null>(null);

  const addCode = (raw: string) => {
    const code = raw.trim().toUpperCase();
    setDraft("");
    setItemError(null);
    if (!code) return;
    if (values.includes(code)) {
      setItemError(`Référence en doublon : "${code}".`);
      return;
    }
    if (!isValidFeai(code)) {
      setItemError(
        "Format attendu : INC suivi de 9 chiffres (ex: INC000000001).",
      );
      return;
    }
    onChange([...values, code]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCode(draft);
    } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const handleAddClick = () => {
    addCode(draft);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {values.length === 0 && (
          <span className="text-[11px] text-slate-400 dark:text-nord-3 italic py-0.5">
            Aucun FEAI/FE
          </span>
        )}
        {values.map((code) => (
          <span
            key={code}
            className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-50 dark:bg-nord-0 text-blue-700 dark:text-nord-8 px-1 py-0 rounded border border-slate-200 dark:border-nord-2"
          >
            {code}
            <button
              type="button"
              onClick={() => onChange(values.filter((c) => c !== code))}
              className="text-slate-400 hover:text-rose-600 dark:text-nord-3 dark:hover:text-nord-11"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (itemError) setItemError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="INC000000001"
          maxLength={12}
          aria-label="Ajouter une référence FEAI"
          className={`w-full min-w-0 flex-1 px-1.5 py-0.5 text-[10px] font-mono tracking-wider bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded focus:outline-none focus:ring-1 ${
            itemError
              ? "border-rose-300 dark:border-nord-11/50 focus:ring-rose-500"
              : "border-slate-200 dark:border-nord-2 focus:border-blue-500 dark:focus:border-nord-8"
          }`}
        />
        <button
          type="button"
          onClick={handleAddClick}
          disabled={!draft.trim()}
          className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-nord-8 disabled:opacity-40"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {itemError && (
        <p className="text-[11px] text-rose-600 dark:text-nord-11">
          {itemError}
        </p>
      )}
      {errorMessage && !itemError && (
        <p className="text-[11px] text-rose-600 dark:text-nord-11">
          {errorMessage}
        </p>
      )}

      {values.length > 0 && !itemError && !errorMessage && (
        <p className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-nord-14">
          <CheckCircle2 className="w-3 h-3" />
          {values.length} référence{values.length > 1 ? "s" : ""} valide
          {values.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
