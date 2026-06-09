"use client";

import { useState } from "react";
import Link from "next/link";

interface PoVRow {
  id: string;
  customerName: string;
  customerIndustry: string;
  ownerType: string;
  selectedProducts: unknown;
  povStartDate: Date | null;
  povEndDate: Date | null;
  readinessScore: number;
  percentValidated: number;
  criteriaTotal: number;
  criteriaValidated: number;
  status: string;
  updatedAt: Date;
  owner: { name?: string | null; email?: string | null };
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60",
  DRAFT:     "bg-card-alt text-fg-dim border border-border",
  AT_RISK:   "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60",
  COMPLETE:  "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60",
  CANCELLED: "bg-card-alt text-fg-muted border border-border",
};

export default function PipelineTable({
  povs, isManager, onRowClick, selectedId,
}: {
  povs: PoVRow[];
  isManager: boolean;
  onRowClick?: (pov: PoVRow) => void;
  selectedId?: string | null;
}) {
  const [search,       setSearch]  = useState("");
  const [filterStatus, setStatus]  = useState("");
  const [sortKey,  setSortKey]     = useState<"updatedAt" | "percentValidated" | "readinessScore">("updatedAt");
  const [sortDir,  setSortDir]     = useState<"asc" | "desc">("desc");

  const sort = (k: typeof sortKey) => {
    if (k === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const now = new Date();

  const filtered = povs
    .filter(p => {
      const q = search.toLowerCase();
      if (search && !p.customerName.toLowerCase().includes(q) && !(p.owner.name ?? "").toLowerCase().includes(q)) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      const av = sortKey === "updatedAt" ? new Date(a.updatedAt).getTime() : (a as unknown as Record<string,number>)[sortKey];
      const bv = sortKey === "updatedAt" ? new Date(b.updatedAt).getTime() : (b as unknown as Record<string,number>)[sortKey];
      return sortDir === "asc" ? av - bv : bv - av;
    });

  const SortTh = ({ label, k }: { label: string; k: typeof sortKey }) => (
    <th
      onClick={() => sort(k)}
      className="text-left px-4 py-3 text-xs font-bold text-fg-muted uppercase tracking-wider cursor-pointer hover:text-fg whitespace-nowrap select-none transition-colors"
    >
      {label} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Filter bar */}
      <div className="px-5 py-3.5 border-b border-border flex flex-wrap gap-3 items-center bg-card">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customer or owner…"
          className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56 bg-card-alt text-fg placeholder:text-fg-muted transition-colors"
        />
        <select
          value={filterStatus}
          onChange={e => setStatus(e.target.value)}
          className="border border-border rounded-lg px-3 py-1.5 text-sm bg-card-alt text-fg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
        >
          <option value="">All statuses</option>
          {["DRAFT","ACTIVE","AT_RISK","COMPLETE","CANCELLED"].map(s => (
            <option key={s} value={s}>{s.replace("_"," ")}</option>
          ))}
        </select>
        <span className="text-xs text-fg-muted ml-auto">{filtered.length} PoVs</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card-alt border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-fg-muted uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-fg-muted uppercase tracking-wider">Solutions</th>
              {isManager && <th className="text-left px-4 py-3 text-xs font-bold text-fg-muted uppercase tracking-wider whitespace-nowrap">Owner</th>}
              <th className="text-left px-4 py-3 text-xs font-bold text-fg-muted uppercase tracking-wider whitespace-nowrap">Dates</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-fg-muted uppercase tracking-wider whitespace-nowrap">Days Left</th>
              <SortTh label="Progress" k="percentValidated" />
              <SortTh label="Score" k="readinessScore" />
              <th className="text-left px-4 py-3 text-xs font-bold text-fg-muted uppercase tracking-wider">Status</th>
              <SortTh label="Updated" k="updatedAt" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isManager ? 9 : 8} className="px-4 py-12 text-center text-fg-muted text-sm">
                  No PoVs found. <Link href="/pov/new" className="text-accent underline">Create your first one →</Link>
                </td>
              </tr>
            )}
            {filtered.map(p => {
              const products = (p.selectedProducts as unknown as string[]) ?? [];
              const daysLeft = p.povEndDate
                ? Math.max(0, Math.ceil((new Date(p.povEndDate).getTime() - now.getTime()) / 86_400_000))
                : null;
              const relativeUpdate = formatRelative(new Date(p.updatedAt), now);
              return (
                <tr
                  key={p.id}
                  onClick={() => onRowClick?.(p)}
                  className={`border-t border-border transition-colors ${onRowClick ? "cursor-pointer" : ""} ${
                    selectedId === p.id
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : "hover:bg-card-alt"
                  }`}
                >
                  <td className="px-4 py-4">
                    <span className="font-semibold text-fg">{p.customerName}</span>
                    {p.customerIndustry && <div className="text-xs text-fg-muted mt-0.5">{p.customerIndustry}</div>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {products.slice(0,3).map(pr => (
                        <span key={pr} className="text-xs bg-card-alt border border-border px-1.5 py-0.5 rounded text-fg-dim">{pr}</span>
                      ))}
                      {products.length > 3 && <span className="text-xs text-fg-muted">+{products.length-3}</span>}
                    </div>
                  </td>
                  {isManager && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-fg">{p.owner.name ?? p.owner.email}</span>
                      <div className="text-xs text-fg-muted">{p.ownerType}</div>
                    </td>
                  )}
                  <td className="px-4 py-4 text-xs text-fg-muted whitespace-nowrap">
                    {p.povStartDate ? new Date(p.povStartDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"}) : "—"}
                    {" → "}
                    {p.povEndDate   ? new Date(p.povEndDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})   : "—"}
                  </td>
                  <td className="px-4 py-4">
                    {daysLeft !== null ? (
                      <span className={`text-sm font-semibold ${daysLeft <= 5 ? "text-red-500" : "text-fg"}`}>
                        {daysLeft}d
                      </span>
                    ) : <span className="text-fg-muted text-sm">—</span>}
                  </td>
                  <td className="px-4 py-4 min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-card-alt border border-border rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.percentValidated === 100 ? "bg-emerald-500" : daysLeft !== null && daysLeft <= 5 ? "bg-amber-500" : "bg-blue-500"}`}
                          style={{width:`${p.percentValidated}%`}}
                        />
                      </div>
                      <span className="text-xs font-semibold text-fg-dim w-8 text-right">{p.percentValidated}%</span>
                    </div>
                    <div className="text-xs text-fg-muted mt-0.5">{p.criteriaValidated}/{p.criteriaTotal}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.readinessScore >= 70
                        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                        : "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30"
                    }`}>
                      {p.readinessScore}/90
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[p.status] ?? "bg-card-alt text-fg-dim border border-border"}`}>
                      {p.status.replace("_"," ")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-fg-muted whitespace-nowrap">{relativeUpdate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatRelative(date: Date, now: Date): string {
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  return date.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
}
