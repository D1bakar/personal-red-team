import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Page title block */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-fade-up">
        <h1 className="h-display text-2xl sm:text-3xl">{title}</h1>
        {subtitle && <p className="subtle mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 animate-fade-up stagger-1">{action}</div>}
    </div>
  );
}

/* Metric tile */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "teal",
  index = 0,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: "teal" | "blue" | "emerald" | "amber" | "rose" | "violet";
  index?: number;
}) {
  const tones: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div
      className={cn("card card-hover p-5 animate-fade-up", `stagger-${Math.min(index + 1, 6)}`)}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="label !mb-0">{label}</span>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
          <Icon size={17} strokeWidth={2.2} />
        </span>
      </div>
      <div className="text-3xl font-semibold tracking-tight text-ink-900">{value}</div>
    </div>
  );
}

/* Empty state */
export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center animate-fade-in">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <Icon size={24} strokeWidth={1.8} />
      </span>
      <h3 className="font-semibold text-ink-900">{title}</h3>
      {hint && <p className="subtle mt-1 max-w-sm">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* Loading shimmer row */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-slate-100 via-slate-200/70 to-slate-100",
        className
      )}
    />
  );
}

/* Progress bar */
export function ProgressBar({
  value,
  tone = "teal",
}: {
  value: number; // 0-100
  tone?: "teal" | "emerald" | "amber" | "rose" | "slate";
}) {
  const tones: Record<string, string> = {
    teal: "from-teal-600 to-cyan-500",
    emerald: "from-emerald-600 to-emerald-400",
    amber: "from-amber-500 to-amber-300",
    rose: "from-rose-600 to-rose-400",
    slate: "from-slate-500 to-slate-400",
  };
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tones[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* Animated score ring */
export function ScoreRing({ value, size = 176 }: { value: number; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2 - 4;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E2E8F0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#scoreGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tracking-tight text-ink-900">{Math.round(pct)}</span>
        <span className="label !mb-0 mt-1">of 100</span>
      </div>
    </div>
  );
}

/* Pill filter group */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200",
            value === o.value
              ? "bg-ink-900 text-white shadow-sm"
              : "bg-white text-ink-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-ink-900"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
