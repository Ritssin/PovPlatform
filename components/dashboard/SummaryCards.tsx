"use client";

interface PoVRow {
  status: string;
  percentValidated: number;
  povEndDate: Date | null;
  updatedAt: Date;
}

const CARD_STYLES = {
  blue:   { strip: "bg-blue-500",    value: "text-blue-500",    iconBg: "bg-blue-50 dark:bg-blue-950/30",    iconFg: "text-blue-500" },
  green:  { strip: "bg-emerald-500", value: "text-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-950/30", iconFg: "text-emerald-500" },
  red:    { strip: "bg-red-500",     value: "text-red-500",     iconBg: "bg-red-50 dark:bg-red-950/30",      iconFg: "text-red-500" },
  purple: { strip: "bg-purple-500",  value: "text-purple-500",  iconBg: "bg-purple-50 dark:bg-purple-950/30", iconFg: "text-purple-500" },
} as const;

function MetricCard({
  label, value, caption, color, icon,
}: {
  label: string;
  value: string | number;
  caption: string;
  color: keyof typeof CARD_STYLES;
  icon: React.ReactNode;
}) {
  const s = CARD_STYLES[color];
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden relative">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.strip}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold tracking-wide uppercase text-fg-muted">{label}</p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.iconBg}`}>
            <span className={`${s.iconFg}`}>{icon}</span>
          </div>
        </div>
        <div className={`text-4xl font-extrabold tracking-tight leading-none mb-2 ${s.value}`}>
          {value}
        </div>
        <p className="text-xs text-fg-muted">{caption}</p>
      </div>
    </div>
  );
}

export default function SummaryCards({ povs }: { povs: PoVRow[] }) {
  const now       = new Date();
  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();

  const active   = povs.filter(p => p.status === "ACTIVE" || p.status === "DRAFT").length;
  const avgPct   = povs.length
    ? Math.round(povs.reduce((s, p) => s + p.percentValidated, 0) / povs.length)
    : 0;
  const atRisk   = povs.filter(p => {
    if (!p.povEndDate) return false;
    const days = Math.ceil((new Date(p.povEndDate).getTime() - now.getTime()) / 86_400_000);
    return days <= 5 && p.percentValidated < 100;
  }).length;
  const complete = povs.filter(p => {
    if (p.status !== "COMPLETE") return false;
    const d = new Date(p.updatedAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Active PoVs"
        value={active}
        caption={`${active === 1 ? "PoV" : "PoVs"} running or in draft`}
        color="blue"
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M5 7H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-2"/>
            <path d="M9 12h6M9 16h4"/>
          </svg>
        }
      />
      <MetricCard
        label="Avg Validated"
        value={`${avgPct}%`}
        caption="Criteria validated across all PoVs"
        color="green"
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        }
      />
      <MetricCard
        label="At Risk"
        value={atRisk}
        caption={atRisk > 0 ? "Ending within 5 days, not complete" : "No PoVs at risk"}
        color="red"
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        }
      />
      <MetricCard
        label="Complete this month"
        value={complete}
        caption={`Finished in ${now.toLocaleString("en-GB", { month: "long" })}`}
        color="purple"
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        }
      />
    </div>
  );
}
