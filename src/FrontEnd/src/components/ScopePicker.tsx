import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { CHECKBOX_CLASS } from "../constants/ui";
import type { ScopeMonitoring } from "../types";
import { BillingCodeBadge } from "./BillingCodeBadge";
import { Modal } from "./Modal";

interface ScopePickerProps {
  scopes: ScopeMonitoring[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /**
   * What the selection is *for*, e.g. "Périmètres analysés" or
   * "Périmètres du journal". It names the list, its dialog and the trigger's
   * accessible name: reusing the picker on another page with "analysés" baked
   * in would name the wrong thing to a screen reader.
   */
  label?: string;
}

export function ScopePicker({
  scopes,
  selectedIds,
  onChange,
  label = "Périmètres",
}: ScopePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const focusSearch = window.setTimeout(() => searchRef.current?.focus(), 0);
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!mobile && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusSearch);
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, mobile]);

  const close = () => {
    setOpen(false);
    setQuery("");
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredScopes = normalizedQuery
    ? scopes.filter((scope) =>
        `${scope.name} ${scope.billing_code ?? ""}`
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
    : scopes;
  const visibleIds = filteredScopes.map((scope) => scope.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
  const selectedScopeCount = scopes.filter((scope) => selectedIds.includes(scope.id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const noVisibleSelected = selectedVisibleCount === 0;

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((current) => current !== id)
        : [...selectedIds, id],
    );
  };

  const selectVisible = () =>
    onChange([...new Set([...selectedIds, ...visibleIds])]);

  const deselectVisible = () =>
    onChange(selectedIds.filter((id) => !visibleIds.includes(id)));

  const pickerContent = (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-nord-3"
          aria-hidden="true"
        />
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              document.getElementById(listId)?.querySelector<HTMLInputElement>("input")?.focus();
            }
          }}
          placeholder="Rechercher un périmètre..."
          aria-label="Rechercher un périmètre"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-nord-2 dark:bg-nord-0 dark:text-nord-5 dark:placeholder:text-nord-3 dark:focus:border-nord-8 dark:focus:ring-nord-8"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium text-slate-600 dark:text-nord-4">
          {selectedVisibleCount} sélectionné{selectedVisibleCount === 1 ? "" : "s"} sur {filteredScopes.length} affiché{filteredScopes.length === 1 ? "" : "s"}
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={selectVisible}
            disabled={allVisibleSelected}
            className="font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline dark:text-nord-8 dark:disabled:text-nord-3"
          >
            Tout cocher
          </button>
          <button
            type="button"
            onClick={deselectVisible}
            disabled={noVisibleSelected}
            className="font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline dark:text-nord-8 dark:disabled:text-nord-3"
          >
            Tout décocher
          </button>
        </div>
      </div>

      <ul
        id={listId}
        aria-label={label}
        className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-slate-100 p-1 dark:border-nord-2"
      >
        {filteredScopes.map((scope) => {
          const selected = selectedIds.includes(scope.id);
          return (
            <li key={scope.id}>
              <label
                className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  selected
                    ? "bg-blue-50 text-blue-900 dark:bg-nord-9/20 dark:text-nord-6"
                    : "text-slate-700 hover:bg-slate-50 dark:text-nord-4 dark:hover:bg-nord-2"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(scope.id)}
                  aria-label={scope.name}
                  className={CHECKBOX_CLASS}
                />
                {selected && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-nord-8" aria-hidden="true" />}
                <span className="min-w-0 flex-1 truncate" title={scope.name}>
                  {scope.name}
                </span>
                <BillingCodeBadge code={scope.billing_code} />
              </label>
            </li>
          );
        })}
        {filteredScopes.length === 0 && (
          <li className="px-3 py-6 text-center text-xs text-slate-500 dark:text-nord-4">
            Aucun périmètre ne correspond à « {query} ».
          </li>
        )}
      </ul>

      <div className="flex justify-end border-t border-slate-100 pt-3 dark:border-nord-2">
        <button
          type="button"
          onClick={close}
          className="min-h-9 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-nord-10 dark:hover:bg-nord-9 dark:focus:ring-nord-8"
        >
          Terminé
        </button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Sélectionner les ${label.toLowerCase()} (${selectedScopeCount} sélectionnés sur ${scopes.length})`}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-2xs transition-colors hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-nord-3 dark:bg-nord-0 dark:text-nord-5 dark:hover:border-nord-8 dark:focus:ring-nord-8"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-nord-3" aria-hidden="true" />
          <span className="truncate">Rechercher un périmètre...</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-medium text-slate-600 dark:text-nord-4">
          {selectedScopeCount} sélectionné{selectedScopeCount === 1 ? "" : "s"}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </span>
      </button>

      {open && mobile && (
        <Modal
          isOpen
          onClose={close}
          title={label}
          subtitle={`${selectedScopeCount} sélectionné${selectedScopeCount === 1 ? "" : "s"} sur ${scopes.length}`}
          maxWidth="lg"
        >
          {pickerContent}
        </Modal>
      )}
      {open && !mobile && (
        <div
          role="dialog"
          aria-label={`Sélection des ${label.toLowerCase()}`}
          className="absolute left-0 top-full z-50 mt-2 w-full min-w-[20rem] rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-nord-2 dark:bg-nord-1"
        >
          {pickerContent}
        </div>
      )}
    </div>
  );
}
