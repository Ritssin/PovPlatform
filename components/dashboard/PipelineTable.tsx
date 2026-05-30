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
  ACTIVE:    "bg-blue-100 text-blue-700",
  DRAFT:     "bg-slate-100 text-slate-600",
  AT_RISK:   "bg-red-100 text-red-700",
  COMPLETE:  "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export default function PipelineTable({
  povs, isManager, onRowClick, selectedId,
}: {
  povs: PoVRow[];
  isManager: boolean;
  onRowClick?: (pov: PoVRow) => void;
  selectedId?: string | null;
}) {
  const [search,    setSearch]    = useState("");
  const [filterStatus, setStatus] = useState("");
  const [sortKey,   setSortKey]   = useState<"updatedAt" | "percentValidated" | "readinessScore">("updatedAt");
  const [sortDir,   setSortDir]   = useState<"asc" | "desc">("desc");

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
      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800 whitespace-nowrap select-none"
    >
      {label} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Filter bar */}
      <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customer or owner…"
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
        />
        <select
          value={filterStatus}
          onChange={e => setStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All statuses</option>
          {["DRAFT","ACTIVE","AT_RISK","COMPLETE","CANCELLED"].map(s => (
            <option key={s} value={s}>{s.replace("_"," ")}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} PoVs</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Solutions</th>
              {isManager && <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Owner</th>}
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Dates</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Days Left</th>
              <SortTh label="Progress" k="percentValidated" />
              <SortTh label="Score" k="readinessScore" />
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <SortTh label="Updated" k="updatedAt" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isManager ? 9 : 8} className="px-4 py-12 text-center text-slate-400 text-sm">
                  No PoVs found. <Link href="/pov/new" className="text-blue-600 underline">Create your first one →</Link>
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
                  className={`border-t border-slate-100 transition-colors ${onRowClick ? "cursor-pointer" : ""} ${selectedId === p.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">{p.customerName}</span>
                    {p.customerIndustry && <div className="text-xs text-slate-500">{p.customerIndustry}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {products.slice(0,3).map(pr => (
                        <span key={pr} className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{pr}</span>
                      ))}
                      {products.length > 3 && <span className="text-xs text-slate-400">+{products.length-3}</span>}
                    </div>
                  </td>
                  {isManager && (
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {p.owner.name ?? p.owner.email}
                      <div className="text-xs text-slate-400">{p.ownerType}</div>
                    </td>
                  )}
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {p.povStartDate ? new Date(p.povStartDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"}) : "—"}
                    {" → "}
                    {p.povEndDate   ? new Date(p.povEndDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})   : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {daysLeft !== null ? (
                      <span className={`text-sm font-semibold ${daysLeft <= 5 ? "text-red-600" : "text-slate-700"}`}>
                        {daysLeft}d
                      </span>
                    ) : <span className="text-slate-400 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3 min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.percentValidated === 100 ? "bg-emerald-500" : daysLeft !== null && daysLeft <= 5 ? "bg-amber-500" : "bg-blue-500"}`}
                          style={{width:`${p.percentValidated}%`}}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-8 text-right">{p.percentValidated}%</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.criteriaValidated}/{p.criteriaTotal}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.readinessScore >= 70 ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}>
                      {p.readinessScore}/90
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[p.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {p.status.replace("_"," ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{relativeUpdate}</td>
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
