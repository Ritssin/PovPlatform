"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PoV, Criterion, Outcome } from "@prisma/client";
import { useAutoSave, SaveIndicator } from "./AutoSave";
import type { ActionItem, UpdateLogEntry, TrackingEntry } from "@/types/pov";

interface Props { pov: PoV; criteriaLibrary: Criterion[]; outcomeLibrary?: Outcome[]; }

const STATUS_OPTIONS = ["Not Started","In Progress","Validated","Blocked","Failed"] as const;
const STATUS_COLORS: Record<string,string> = {
  "Validated":   "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60",
  "In Progress": "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60",
  "Blocked":     "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60",
  "Failed":      "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/60",
  "Not Started": "text-fg-dim bg-card-alt border-border",
};

export default function ExecuteForm({ pov, criteriaLibrary, outcomeLibrary = [] }: Props) {
  const router = useRouter();
  const { save, status } = useAutoSave(pov.id);

  const planCriteriaIds = (pov.planCriteria as unknown as string[]) ?? [];
  const customCriteria  = (pov.customCriteria as unknown as Array<{id:string;product:string;requirement:string}>) ?? [];

  const getCriterion = (id: string) => {
    return criteriaLibrary.find(c => c.id === id) ?? customCriteria.find(c => c.id === id) ?? null;
  };

  const planCriteria = planCriteriaIds.map(getCriterion).filter(Boolean) as Criterion[];

  const [tracking,    setTracking]    = useState<Record<string, TrackingEntry>>((pov.trackingData as unknown as Record<string,TrackingEntry>) ?? {});
  const [actionItems, setActionItems] = useState<ActionItem[]>((pov.actionItems as unknown as ActionItem[]) ?? []);
  const [updateLog,   setUpdateLog]   = useState<UpdateLogEntry[]>((pov.updateLog as unknown as UpdateLogEntry[]) ?? []);
  const [povStartDate, setPovStartDate] = useState(pov.povStartDate ? new Date(pov.povStartDate).toISOString().split("T")[0] : "");
  const [povEndDate,   setPovEndDate]   = useState(pov.povEndDate   ? new Date(pov.povEndDate).toISOString().split("T")[0]   : "");
  const [outcomeSummary, setOutcomeSummary] = useState(pov.outcomeSummary ?? "");
  const [nextSteps,      setNextSteps]      = useState(pov.nextSteps ?? "");
  const [logTitle, setLogTitle] = useState("");
  const [logNotes, setLogNotes] = useState("");

  const validated    = planCriteria.filter(c => tracking[c.id]?.status === "Validated").length;
  const total        = planCriteria.length;
  const pct          = total > 0 ? Math.round((validated / total) * 100) : 0;
  const today        = new Date(); today.setHours(0,0,0,0);
  const daysLeft     = povEndDate ? Math.max(0, Math.ceil((new Date(povEndDate).getTime() - today.getTime()) / 86_400_000)) : null;
  const isComplete   = validated === total && total > 0;
  const isAtRisk     = !isComplete && povEndDate && daysLeft !== null && daysLeft <= 5;
  const overallStatus = isComplete ? "Complete" : isAtRisk ? "At Risk" : "On Track";
  const statusColor   = isComplete
    ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
    : isAtRisk
    ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300"
    : "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300";
  const barColor = isComplete ? "bg-emerald-500" : isAtRisk ? "bg-amber-500" : "bg-blue-500";

  const updateTracking = (cid: string, field: keyof TrackingEntry, value: string) => {
    const existing = tracking[cid] ?? { status: "Not Started" as const, findings: "", owner: "" };
    const entry: TrackingEntry = { ...existing, [field]: value };
    const next = { ...tracking, [cid]: entry };
    setTracking(next);
    save({ trackingData: next });
  };

  const updateAction = (id: number, field: keyof ActionItem, value: string | boolean) => {
    const next = actionItems.map(a => a.id === id ? { ...a, [field]: value } : a);
    setActionItems(next);
    save({ actionItems: next });
  };

  const addAction = () => {
    const maxId = actionItems.reduce((m, a) => Math.max(m, a.id), 0);
    const next = [...actionItems, { id: maxId+1, task:"", owner:"", dueDate:"", priority:"Medium" as const, status:"Not Started" as const }];
    setActionItems(next);
    save({ actionItems: next });
  };

  const removeAction = (id: number) => {
    const next = actionItems.filter(a => a.id !== id);
    setActionItems(next);
    save({ actionItems: next });
  };

  const logEntry = () => {
    if (!logNotes.trim()) return;
    const entry: UpdateLogEntry = { id: Date.now(), date: new Date().toISOString(), title: logTitle.trim(), text: logNotes.trim() };
    const next = [entry, ...updateLog];
    setUpdateLog(next);
    setLogTitle(""); setLogNotes("");
    save({ updateLog: next });
  };

  const exportWord = async () => {
    const res = await fetch(`/api/pov/${pov.id}/export/word`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${pov.customerName.replace(/\s+/g,"_")}_PoV.doc`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportJson = async () => {
    const res = await fetch(`/api/pov/${pov.id}/export/json`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${pov.customerName.replace(/\s+/g,"_")}_PoV_Deck.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const iCell = "border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-card text-fg placeholder:text-fg-muted transition-colors";
  const card  = "bg-card rounded-2xl border border-border";
  const inp   = "w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-card text-fg placeholder:text-fg-muted transition-colors";
  const lbl   = "block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-fg">Execute</h2>
        <SaveIndicator status={status} />
      </div>

      {/* Outcome completion tiles */}
      {outcomeLibrary.length > 0 && (() => {
        const selectedOutcomeIds = (pov.selectedOutcomes as unknown as string[]) ?? [];
        const selectedOutcomes = outcomeLibrary.filter(o => selectedOutcomeIds.includes(o.id));
        if (!selectedOutcomes.length) return null;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {selectedOutcomes.map(o => {
              const criteriaInPlan = planCriteriaIds.filter(id => o.criteriaIds.includes(id));
              const validatedCount = criteriaInPlan.filter(id => tracking[id]?.status === "Validated").length;
              const t = criteriaInPlan.length;
              const pctO = t > 0 ? Math.round((validatedCount / t) * 100) : 0;
              return (
                <div key={o.id} className="bg-card rounded-xl border border-border p-3 text-center">
                  <div className="text-xl mb-1">{o.icon}</div>
                  <p className="text-xs font-semibold text-fg leading-tight mb-2">{o.title}</p>
                  <div className="h-1.5 bg-card-alt border border-border rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all ${pctO === 100 ? "bg-emerald-500" : "bg-blue-400"}`}
                      style={{ width: `${pctO}%` }}
                    />
                  </div>
                  <p className="text-xs text-fg-muted">{validatedCount}/{t}</p>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Status bar */}
      <div className={`${card} p-5`}>
        <h3 className="font-bold text-fg mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-fg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Evaluation Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-4">
          {[["Start Date","date",povStartDate,setPovStartDate,"povStartDate"],
            ["End Date","date",povEndDate,setPovEndDate,"povEndDate"]].map(([label,type,val,setter,key]) => (
            <div key={key as string}>
              <label className={lbl}>{label as string}</label>
              <input type={type as string} value={val as string}
                onChange={e => { (setter as (v:string)=>void)(e.target.value); save({ [key as string]: e.target.value || null }); }}
                className={inp}/>
            </div>
          ))}
          <div className="text-center">
            <div className="text-3xl font-bold text-fg leading-none">{daysLeft ?? "—"}</div>
            <div className="text-xs text-fg-muted mt-1">days remaining</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-fg leading-none">{pct}%</div>
            <div className="text-xs text-fg-muted mt-1">{validated}/{total} validated</div>
            <span className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{overallStatus}</span>
          </div>
        </div>
        {total > 0 && (
          <div className="bg-card-alt border border-border rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all ${barColor}`} style={{width:`${pct}%`}}/>
          </div>
        )}
      </div>

      {/* Action Items */}
      <div className={`${card} overflow-hidden`}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-fg">Activities & Actions</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-fg-muted">{actionItems.filter(a=>a.status==="Done").length}/{actionItems.length} complete</span>
            <button onClick={addAction} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-medium rounded-lg hover:bg-[#0D2137] transition-colors">
              + Add
            </button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {actionItems.map(a => {
            const isDone = a.status === "Done";
            const isOverdue = a.dueDate && new Date(a.dueDate) < today && !isDone;
            return (
              <div key={a.id} className={`flex items-center gap-3 px-4 py-3 ${isOverdue ? "bg-amber-50 dark:bg-amber-950/20" : isDone ? "bg-card-alt/60" : ""}`}>
                <input type="checkbox" checked={isDone}
                  onChange={e => updateAction(a.id, "status", e.target.checked ? "Done" : "Not Started")}
                  className="h-4 w-4 rounded border-border text-emerald-600 shrink-0"/>
                <input value={a.task} onChange={e => updateAction(a.id,"task",e.target.value)}
                  className={`flex-1 min-w-0 text-sm bg-transparent border-none outline-none ${isDone ? "line-through text-fg-muted" : "text-fg"}`}
                  placeholder="Task description…"/>
                <input value={a.owner} onChange={e => updateAction(a.id,"owner",e.target.value)}
                  placeholder="Owner" className={`${iCell} w-24 shrink-0`}/>
                <input type="date" value={a.dueDate} onChange={e => updateAction(a.id,"dueDate",e.target.value)}
                  className={`${iCell} w-36 shrink-0 ${isOverdue ? "text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700" : ""}`}/>
                <select value={a.status} onChange={e => updateAction(a.id,"status",e.target.value)}
                  className={`${iCell} w-32 shrink-0`}>
                  {["Not Started","In Progress","Done","Blocked"].map(s=><option key={s}>{s}</option>)}
                </select>
                <button onClick={() => removeAction(a.id)} className="p-1 text-fg-muted hover:text-red-500 shrink-0 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-xs transition-colors">✕</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Criteria Tracking */}
      {planCriteria.length > 0 && (
        <div className={`${card} overflow-hidden`}>
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-bold text-fg">Success Criteria Progress</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-card-alt border-b border-border">
                <tr>
                  {["Criteria","Product","Owner","Status","Evidence / Findings"].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-fg-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planCriteria.map(c => {
                  const t: TrackingEntry = tracking[c.id] ?? { status:"Not Started", findings:"", owner:"" };
                  return (
                    <tr key={c.id} className="border-t border-border align-top hover:bg-card-alt transition-colors">
                      <td className="px-4 py-3 min-w-[200px]">
                        <div className="font-medium text-fg text-sm">{c.requirement}</div>
                        <div className="text-xs font-mono text-fg-muted mt-0.5">{c.id}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs bg-card-alt border border-border px-2 py-1 rounded text-fg-dim">{c.product}</span>
                      </td>
                      <td className="px-4 py-3 min-w-[110px]">
                        <input value={t.owner} onChange={e => updateTracking(c.id,"owner",e.target.value)}
                          className={`${iCell} w-full`} placeholder="Owner"/>
                      </td>
                      <td className="px-4 py-3">
                        <select value={t.status} onChange={e => updateTracking(c.id,"status",e.target.value)}
                          className={`border rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none transition-colors ${STATUS_COLORS[t.status] ?? STATUS_COLORS["Not Started"]}`}>
                          {STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 min-w-[250px]">
                        <textarea rows={2} value={t.findings} onChange={e => updateTracking(c.id,"findings",e.target.value)}
                          placeholder="Evidence, test results, observations…"
                          className={`${iCell} w-full resize-none`}/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Progress Notes */}
      <div className={`${card} p-6`}>
        <h3 className="font-bold text-fg mb-4">Progress Notes</h3>
        <div className="space-y-2 mb-4">
          <div>
            <label className={lbl}>
              Meeting or update title <span className="font-normal normal-case text-fg-muted">(optional)</span>
            </label>
            <input value={logTitle} onChange={e => setLogTitle(e.target.value)}
              placeholder="e.g. Week 1 customer call, Internal review…"
              className={`w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-card text-fg placeholder:text-fg-muted`}/>
          </div>
          <div>
            <label className={lbl}>Notes</label>
            <div className="flex gap-2">
              <textarea rows={3} value={logNotes} onChange={e => setLogNotes(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); logEntry(); }}}
                placeholder="Progress, findings, blockers… (Ctrl+Enter to save)"
                className={`flex-1 rounded-xl border border-border px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-card text-fg placeholder:text-fg-muted`}/>
              <button onClick={logEntry} disabled={!logNotes.trim()}
                className="px-4 py-2 bg-[#0B1F3A] text-white text-sm font-medium rounded-xl hover:bg-[#0D2137] disabled:opacity-40 self-end whitespace-nowrap transition-colors">
                Log it
              </button>
            </div>
          </div>
        </div>
        {updateLog.length === 0 && <p className="text-sm text-fg-muted italic">No updates logged yet.</p>}
        <div className="space-y-3">
          {updateLog.map((entry, i) => {
            const prev = updateLog[i + 1];
            const dayGap = prev ? Math.floor((new Date(entry.date).getTime() - new Date(prev.date).getTime()) / 86_400_000) : 0;
            return (
              <div key={entry.id}>
                {dayGap > 0 && (
                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 h-px bg-border"/>
                    <span className="text-xs text-fg-muted">{dayGap === 1 ? "1 day later" : `${dayGap} days later`}</span>
                    <div className="flex-1 h-px bg-border"/>
                  </div>
                )}
                <div className="bg-card-alt rounded-xl p-4 border border-border">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      {entry.title && <p className="font-semibold text-fg text-sm">{entry.title}</p>}
                      <p className="text-xs text-fg-muted font-mono">
                        {new Date(entry.date).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}
                        {" · "}
                        {new Date(entry.date).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
                      </p>
                    </div>
                    <button onClick={() => {
                      const next = updateLog.filter(e => e.id !== entry.id);
                      setUpdateLog(next); save({ updateLog: next });
                    }} className="p-1.5 text-fg-muted hover:text-red-500 rounded text-xs transition-colors">✕</button>
                  </div>
                  <p className="text-sm text-fg-dim leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary & Next Steps */}
      <div className={`${card} p-6`}>
        <h3 className="font-bold text-fg mb-4">Summary & Next Steps</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Outcome Summary</label>
            <textarea rows={6} value={outcomeSummary}
              onChange={e => { setOutcomeSummary(e.target.value); save({ outcomeSummary: e.target.value }); }}
              placeholder="Summarise the key outcomes, improvements measured, and business value demonstrated"
              className={`w-full rounded-xl border border-border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-card text-fg placeholder:text-fg-muted`}/>
          </div>
          <div>
            <label className={lbl}>Next Steps</label>
            <textarea rows={6} value={nextSteps}
              onChange={e => { setNextSteps(e.target.value); save({ nextSteps: e.target.value }); }}
              placeholder="Agreed next steps, rollout phases, and key decision dates"
              className={`w-full rounded-xl border border-border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-card text-fg placeholder:text-fg-muted`}/>
          </div>
        </div>
      </div>

      {/* Export panel — stays dark in both modes intentionally */}
      <div className="bg-[#0B1F3A] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-blue-300/70 mb-1">Reports</div>
            <h3 className="text-lg font-bold">Share Your Evaluation</h3>
            <p className="text-blue-300/80 text-sm mt-1">
              {validated}/{total} validated · {pov.customerName} · {new Date().toLocaleDateString("en-GB",{month:"short",year:"numeric"})}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={exportWord}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0B1F3A] font-semibold rounded-xl hover:bg-slate-100 transition-all text-sm">
              Word Summary
            </button>
            <button onClick={exportJson}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-400 transition-all text-sm">
              Export Deck (JSON)
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => router.push(`/pov/${pov.id}/criteria`)}
          className="flex items-center gap-2 px-5 py-2.5 border border-border text-fg-dim rounded-xl hover:bg-card-alt text-sm transition-colors">
          ← Back to Criteria
        </button>
        <button onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 border border-border text-fg-dim rounded-xl hover:bg-card-alt text-sm transition-colors">
          ← Dashboard
        </button>
      </div>
    </div>
  );
}
