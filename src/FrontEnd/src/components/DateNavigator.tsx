import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { isValidIsoDate } from '../utils/date';

interface DateNavigatorProps {
  value: string;
  today: string;
  onChange: (day: string) => void;
}

function shiftDay(day: string, amount: number): string {
  const [year, month, date] = day.split('-').map(Number);
  const shifted = new Date(year, month - 1, date + amount);
  return [shifted.getFullYear(), shifted.getMonth() + 1, shifted.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('-');
}

function formatDayMonthFr(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) return isoDate;
  const [year, month, date] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, date));
}

function formatWeekdayFr(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) return isoDate;
  const [year, month, date] = isoDate.split('-').map(Number);
  const weekday = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
  }).format(new Date(year, month - 1, date));
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function DateNavigator({ value, today, onChange }: DateNavigatorProps) {
  const isToday = value === today;
  const isYesterday = !isToday && value === shiftDay(today, -1);
  const changeDay = (day: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(day) && day <= today) {
      onChange(day);
    }
  };

  const mainLabel = isToday
    ? "Aujourd'hui"
    : isYesterday
      ? 'Hier'
      : formatWeekdayFr(value);
  const subLabel = formatDayMonthFr(value);
  const fullLabel = `${mainLabel} · ${subLabel}`;

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 dark:border-nord-2 bg-white dark:bg-nord-1 p-1 shadow-2xs">
      <button
        type="button"
        onClick={() => changeDay(shiftDay(value, -1))}
        className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-md text-slate-600 dark:text-nord-4 hover:bg-slate-100 dark:hover:bg-nord-2 hover:text-slate-900 dark:hover:text-nord-6 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8"
        aria-label="Afficher le jour précédent"
        title="Jour précédent"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <label className="relative inline-flex items-center gap-1.5 rounded-md py-1 pl-2 pr-3 text-left focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-nord-8 cursor-pointer">
        <Calendar
          className="h-3.5 w-3.5 text-blue-600 dark:text-nord-8"
          aria-hidden="true"
        />
        <span className="sr-only">Jour affiché</span>
        <span className="flex flex-col leading-tight">
          <span className="text-xs font-semibold text-slate-700 dark:text-nord-5">
            {mainLabel}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-nord-4">
            {subLabel}
          </span>
        </span>
        <input
          type="date"
          value={value}
          max={today}
          onChange={(event) => changeDay(event.target.value)}
          aria-label={`Jour affiché : ${fullLabel}`}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>

      <button
        type="button"
        onClick={() => changeDay(shiftDay(value, 1))}
        disabled={isToday}
        className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-md text-slate-600 dark:text-nord-4 hover:bg-slate-100 dark:hover:bg-nord-2 hover:text-slate-900 dark:hover:text-nord-6 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Afficher le jour suivant"
        title="Jour suivant"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {!isToday && (
        <button
          type="button"
          onClick={() => changeDay(today)}
          className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-blue-700 dark:text-nord-8 hover:bg-blue-50 dark:hover:bg-nord-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Aujourd'hui
        </button>
      )}
    </div>
  );
}