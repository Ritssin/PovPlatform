"use client";

interface PoVRow {
  status: string;
  percentValidated: number;
  povEndDate: Date | null;
  updatedAt: Date;
}

export default function SummaryCards({ povs }: { povs: PoVRow[] }) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();

  const active    = povs.filter(p => p.status === "ACTIVE" || p.status === "DRAFT").length;
  const avgPct    = povs.length
    ? Math.round(povs.reduce((s, p) => s + p.percentValidated, 0) / povs.length)
    : 0;
  const atRisk    = povs.filter(p => {
    if (!p.povEndDate) return false;
    const days = Math.ceil((new Date(p.povEndDate).getTime() - now.getTime()) / 86_400_000);
    return days <= 5 && p.percentValidated < 100;
  }).length;
  const complete  = povs.filter(p => {
    if (p.status !== "COMPLETE") return false;
    const d = new Date(p.updatedAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const cards = [
    { label: "Active PoVs",         value: active,  color: "text-blue-600",    bg: "bg-blue-50" },
    { label: "Avg Validated",        value: `${avgPct}%`, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "At Risk",              value: atRisk,  color: "text-red-600",     bg: "bg-red-50" },
    { label: "Complete this month",  value: complete, color: "text-purple-600",  bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
          <div className="text-sm text-slate-500 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
