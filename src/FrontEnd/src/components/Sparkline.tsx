import { useId } from "react";

interface SparklineProps {
  values: number[];
  domain?: readonly [number, number];
  tone: "amber" | "rose" | "emerald" | "blue";
  label: string;
  className?: string;
}

const SPARKLINE_WIDTH = 100;
const SPARKLINE_HEIGHT = 32;
const PADDING = 4;

function buildPath(values: number[], domain: [number, number] | undefined): string {
  if (values.length === 0) return "";
  const [min, max] = domain ?? [Math.min(...values), Math.max(...values)];
  const range = max - min || 1;
  const stepX = (SPARKLINE_WIDTH - 2 * PADDING) / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => {
    const x = PADDING + i * stepX;
    const y = SPARKLINE_HEIGHT - PADDING - ((v - min) / range) * (SPARKLINE_HEIGHT - 2 * PADDING);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  });

  return points.join(" ");
}

export function Sparkline({ values, domain, tone, label, className }: SparklineProps) {
  const id = useId();
  const path = buildPath(values, domain as [number, number] | undefined);
  const allZero = values.length > 0 && values.every((v) => v === 0);

  if (values.length === 0 || allZero) {
    return null;
  }

  return (
    <svg
      role="img"
      aria-label={label}
      className={`h-8 w-full text-${tone}-600 dark:text-${tone}-400 ${className ?? ""}`}
      viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`sparkline-gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`${path} L${SPARKLINE_WIDTH - PADDING} ${SPARKLINE_HEIGHT - PADDING} L${PADDING} ${SPARKLINE_HEIGHT - PADDING} Z`}
        fill={`url(#sparkline-gradient-${id})`}
      />
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}