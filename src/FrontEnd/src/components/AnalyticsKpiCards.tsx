import { Activity, AlertCircle, Inbox, ClipboardCheck, OctagonX } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { CARD_CLASS, CARD_PADDING_CLASS, CARD_TITLE_CLASS } from "../constants/ui";

interface KpiCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  tone: "amber" | "rose" | "emerald" | "blue";
  sparklineValues: number[];
  sparklineDomain?: readonly [number, number];
  sparklineLabel: string;
  delta?: { pct: number | null; label: string };
}

function KpiCard({
  label,
  value,
  suffix = "",
  icon,
  tone,
  sparklineValues,
  sparklineDomain,
  sparklineLabel,
  delta,
}: KpiCardProps) {
  const deltaColor =
    delta?.pct === null
      ? ""
      : delta?.pct === 0
      ? "text-slate-400 dark:text-nord-3"
      : delta?.pct! > 0
      ? "text-red-600 dark:text-nord-11"
      : "text-emerald-700 dark:text-nord-14";

  const deltaSign = delta?.pct === null ? "" : delta?.pct! > 0 ? "+" : "";

  return (
    <div className={`${CARD_CLASS} ${CARD_PADDING_CLASS}`}>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-nord-4">
        <span className="text-lg" aria-hidden="true">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-nord-6">
        {value.toLocaleString("fr-FR")}{suffix}
      </dd>
      {sparklineValues.length > 0 && (
        <Sparkline
          values={sparklineValues}
          domain={sparklineDomain}
          tone={tone}
          label={sparklineLabel}
          className="mt-2 h-8 w-full"
        />
      )}
      {delta && (
        <p className={`mt-1.5 text-xs ${deltaColor}`} title={`vs période précédente : ${deltaSign}{delta.pct} %`}>
          {delta.pct === null ? "— vs période précédente" : `${deltaSign}{delta.pct} %`}
        </p>
      )}
    </div>
  );
}

interface AnalyticsKpiCardsProps {
  summary: {
    erreurs: number;
    incidents: number;
    arriere: number;
    couverture: number;
    /**
     * Relevés KO sur la période — cellules périmètre × jour, **pas** des
     * journées : deux périmètres bloqués le même jour en comptent deux.
     *
     * Ils sont exclus de `traitees` et de `couverture`, sans quoi un relevé que
     * personne n'a pu produire compterait comme une saisie — et la couverture
     * s'améliorerait donc d'elle-même. Ce nombre est la contrepartie : il dit
     * pourquoi le taux baisse.
     */
    relevesKo: number;
  };
  delta: {
    erreursPct: number | null;
    incidentsPct: number | null;
    arrierePct: number | null;
    couverturePct: number | null;
  } | null;
  compare: boolean;
  series: {
    erreurs: number[];
    incidents: number[];
    arriere: number[];
    couverture: number[];
  };
}

export function AnalyticsKpiCards({ summary, delta, compare, series }: AnalyticsKpiCardsProps) {
  const cards = [
    {
      label: "Erreurs",
      value: summary.erreurs,
      deltaKey: "erreursPct" as const,
      icon: <Activity className="w-4 h-4 text-amber-600 dark:text-nord-13" aria-hidden="true" />,
      tone: "amber" as const,
      sparklineValues: series.erreurs,
      sparklineLabel: `Tendance des erreurs sur la période : de ${Math.min(...series.erreurs)} à ${Math.max(...series.erreurs)}`,
      delta: compare && delta
        ? { pct: delta.erreursPct, label: "erreurs" }
        : undefined,
    },
    {
      label: "Incidents",
      value: summary.incidents,
      deltaKey: "incidentsPct" as const,
      icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-nord-11" aria-hidden="true" />,
      tone: "rose" as const,
      sparklineValues: series.incidents,
      sparklineLabel: `Tendance des incidents sur la période : de ${Math.min(...series.incidents)} à ${Math.max(...series.incidents)}`,
      delta: compare && delta
        ? { pct: delta.incidentsPct, label: "incidents" }
        : undefined,
    },
    {
      label: "En attente",
      value: summary.arriere,
      deltaKey: "arrierePct" as const,
      icon: <Inbox className="w-4 h-4 text-amber-600 dark:text-nord-13" aria-hidden="true" />,
      tone: "amber" as const,
      sparklineValues: series.arriere,
      sparklineLabel: `Tendance de l'arriéré sur la période : de ${Math.min(...series.arriere)} à ${Math.max(...series.arriere)}`,
      delta: compare && delta
        ? { pct: delta.arrierePct, label: "arrière" }
        : undefined,
    },
    {
      label: "Couverture de saisie",
      value: Math.round(summary.couverture),
      suffix: " %",
      deltaKey: "couverturePct" as const,
      icon: <ClipboardCheck className="w-4 h-4 text-emerald-600 dark:text-nord-14" aria-hidden="true" />,
      tone: "emerald" as const,
      sparklineValues: series.couverture,
      sparklineDomain: [0, 100] as const,
      sparklineLabel: `Tendance de la couverture sur la période : de ${Math.min(...series.couverture)} % à ${Math.max(...series.couverture)} %`,
      delta: compare && delta
        ? { pct: delta.couverturePct, label: "couverture" }
        : undefined,
    },
  ];

  return (
    <section aria-labelledby="kpi-heading">
      <h2 id="kpi-heading" className="sr-only">
        Résumé de la période
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <KpiCard key={card.deltaKey} {...card} />
        ))}
      </dl>
      {summary.relevesKo > 0 && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-nord-11/30 dark:bg-nord-11/15 dark:text-nord-11">
          <OctagonX className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {summary.relevesKo} relevé{summary.relevesKo > 1 ? 's' : ''} KO sur
            la période (périmètre × jour), exclu
            {summary.relevesKo > 1 ? 's' : ''} de la couverture et des totaux :
            le traitement y était impossible pour un problème technique.
          </span>
        </p>
      )}
      {compare && delta && (
        <p className="mt-3 text-xs text-slate-500 dark:text-nord-4" id="delta-footnote">
          Écarts calculés vs période précédente de même longueur.
        </p>
      )}
    </section>
  );
}