"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { PoV, Criterion, Outcome, Pillar } from "@prisma/client";
import { useAutoSave, SaveIndicator } from "./AutoSave";
import type { CustomCriterion, CriterionEdit } from "@/types/pov";

interface Props {
  pov: PoV;
  criteriaLibrary: Criterion[];
  outcomeLibrary: Outcome[];
  pillars: Pillar[];
}

const OUTCOME_COLORS: Record<string, { sel: string; icon: string; dot: string }> = {
  red:    { sel: "border-red-400 bg-red-50 dark:bg-red-950/30",       icon: "text-red-500",    dot: "bg-red-400" },
  purple: { sel: "border-purple-400 bg-purple-50 dark:bg-purple-950/30", icon: "text-purple-500", dot: "bg-purple-400" },
  blue:   { sel: "border-blue-400 bg-blue-50 dark:bg-blue-950/30",    icon: "text-blue-500",   dot: "bg-blue-400" },
  orange: { sel: "border-orange-400 bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-500", dot: "bg-orange-400" },
  teal:   { sel: "border-teal-400 bg-teal-50 dark:bg-teal-950/30",    icon: "text-teal-500",   dot: "bg-teal-400" },
  green:  { sel: "border-green-400 bg-green-50 dark:bg-green-950/30", icon: "text-green-500",  dot: "bg-green-400" },
  amber:  { sel: "border-amber-400 bg-amber-50 dark:bg-amber-950/30", icon: "text-amber-500",  dot: "bg-amber-400" },
  indigo: { sel: "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30", icon: "text-indigo-500", dot: "bg-indigo-400" },
  cyan:   { sel: "border-cyan-400 bg-cyan-50 dark:bg-cyan-950/30",    icon: "text-cyan-500",   dot: "bg-cyan-400" },
  pink:   { sel: "border-pink-400 bg-pink-50 dark:bg-pink-950/30",    icon: "text-pink-500",   dot: "bg-pink-400" },
  gray:   { sel: "border-border bg-card-alt",                          icon: "text-fg-muted",   dot: "bg-fg-muted" },
};

const PILLAR_COLORS: Record<string, string> = {
  PLATFORM: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
  NATIVE:   "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/60",
  INTEL:    "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
  AGENTIC:  "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60",
  PRICING:  "bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60",
};

export default function SuccessCriteriaForm({ pov, criteriaLibrary, outcomeLibrary, pillars }: Props) {
  const router = useRouter();
  const { save, saveImmediate, status } = useAutoSave(pov.id);

  const selectedProducts = (pov.selectedProducts as unknown as string[]) ?? [];

  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>((pov.selectedOutcomes as unknown as string[]) ?? []);
  const [planCriteria, setPlanCriteria]         = useState<string[]>((pov.planCriteria as unknown as string[]) ?? []);
  const [criteriaEdits, setCriteriaEdits]       = useState<Record<string, CriterionEdit>>((pov.criteriaEdits as unknown as Record<string, CriterionEdit>) ?? {});
  const [customCriteria, setCustomCriteria]     = useState<CustomCriterion[]>((pov.customCriteria as unknown as CustomCriterion[]) ?? []);
  const [showBrowse, setShowBrowse]             = useState(false);
  const [browseSearch, setBrowseSearch]         = useState("");
  const [browseProduct, setBrowseProduct]       = useState(selectedProducts[0] ?? "");
  const [showAddCustom, setShowAddCustom]       = useState(false);
  const [customForm, setCustomForm]             = useState({ product: "XDR", requirement: "", businessProblem: "", successCriteria: "", measurement: "", competitiveEdge: "", edgeTags: [] as string[] });

  const getCriterion = useCallback((id: string): (Criterion | CustomCriterion) | null => {
    const custom = customCriteria.find(c => c.id === id);
    const base = custom || criteriaLibrary.find(c => c.id === id);
    if (!base) return null;
    const edits = criteriaEdits[id] ?? {};
    return { ...base, ...edits } as Criterion | CustomCriterion;
  }, [criteriaLibrary, customCriteria, criteriaEdits]);

  const getMatchCount = (o: Outcome) => {
    if (selectedProducts.length === 0) return o.criteriaIds.length;
    return o.criteriaIds.filter(cid => {
      const c = criteriaLibrary.find(c => c.id === cid);
      return c && selectedProducts.includes(c.product);
    }).length;
  };

  const draftFromOutcomes = (outcomeIds: string[]) => {
    const seen = new Set<string>();
    const ids: string[] = [];
    outcomeIds.forEach(oid => {
      const o = outcomeLibrary.find(o => o.id === oid);
      if (!o) return;
      o.criteriaIds.forEach(cid => {
        if (seen.has(cid)) return;
        const c = criteriaLibrary.find(c => c.id === cid);
        if (selectedProducts.length > 0 && c && !selectedProducts.includes(c.product)) return;
        seen.add(cid);
        ids.push(cid);
      });
    });
    return ids;
  };

  const toggleOutcome = (id: string) => {
    const next = selectedOutcomes.includes(id)
      ? selectedOutcomes.filter(x => x !== id)
      : [...selectedOutcomes, id];
    setSelectedOutcomes(next);
    save({ selectedOutcomes: next });
  };

  const buildFromOutcomes = () => {
    const ids = draftFromOutcomes(selectedOutcomes);
    setPlanCriteria(ids);
    save({ planCriteria: ids });
  };

  const toggleCriterion = (id: string) => {
    const next = planCriteria.includes(id)
      ? planCriteria.filter(x => x !== id)
      : [...planCriteria, id];
    setPlanCriteria(next);
    save({ planCriteria: next });
  };

  const removeCriterion = (id: string) => {
    const next = planCriteria.filter(x => x !== id);
    setPlanCriteria(next);
    save({ planCriteria: next });
  };

  const editCriterionField = (id: string, field: string, value: string) => {
    const next = { ...criteriaEdits, [id]: { ...(criteriaEdits[id] ?? {}), [field]: value } };
    setCriteriaEdits(next);
    save({ criteriaEdits: next });
  };

  const resetCriterionEdits = (id: string) => {
    const next = { ...criteriaEdits };
    delete next[id];
    setCriteriaEdits(next);
    save({ criteriaEdits: next });
  };

  const moveCriterion = (id: string, dir: "up" | "down") => {
    const i = planCriteria.indexOf(id);
    const ni = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || ni < 0 || ni >= planCriteria.length) return;
    const next = [...planCriteria];
    [next[i], next[ni]] = [next[ni], next[i]];
    setPlanCriteria(next);
    save({ planCriteria: next });
  };

  const addCustomCriterion = () => {
    if (!customForm.requirement.trim()) return;
    const nc: CustomCriterion = {
      id: `CUSTOM-${Date.now()}`,
      isCustom: true,
      product: customForm.product,
      requirement: customForm.requirement,
      businessProblem: customForm.businessProblem,
      successCriteria: customForm.successCriteria,
      measurement: customForm.measurement,
      competitiveEdge: customForm.competitiveEdge,
      edgeTags: customForm.edgeTags,
    };
    const nextCustom = [...customCriteria, nc];
    const nextPlan   = [...planCriteria, nc.id];
    setCustomCriteria(nextCustom);
    setPlanCriteria(nextPlan);
    save({ customCriteria: nextCustom, planCriteria: nextPlan });
    setShowAddCustom(false);
    setCustomForm({ product:"XDR", requirement:"", businessProblem:"", successCriteria:"", measurement:"", competitiveEdge:"", edgeTags:[] });
  };

  const filteredBrowse = criteriaLibrary.filter(c => {
    if (browseProduct && c.product !== browseProduct) return false;
    if (browseSearch) {
      const q = browseSearch.toLowerCase();
      return c.requirement.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    }
    return true;
  });

  const uniqueProducts = Array.from(new Set(criteriaLibrary.map(c => c.product))).sort();

  async function handleNext() {
    await saveImmediate({ selectedOutcomes, planCriteria, criteriaEdits, customCriteria });
    router.push(`/pov/${pov.id}/execute`);
  }

  const inp = "w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-card text-fg placeholder:text-fg-muted transition-colors";
  const card = "bg-card rounded-2xl border border-border p-6";

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-fg">Success Criteria</h2>
        <SaveIndicator status={status} />
      </div>

      {/* Evaluation Objectives */}
      <div className={card}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-fg">Evaluation Objectives</h3>
          <span className="text-sm text-fg-muted">{selectedOutcomes.length} selected</span>
        </div>
        <p className="text-sm text-fg-dim mb-4">
          Choose the areas you want to evaluate.{selectedProducts.length > 0
            ? " Tiles show matching criteria count for your selected products."
            : ""}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {outcomeLibrary.map(o => {
            const sel = selectedOutcomes.includes(o.id);
            const matchCount = getMatchCount(o);
            const hasMatch = matchCount > 0 || selectedProducts.length === 0;
            const oc = OUTCOME_COLORS[o.color] ?? OUTCOME_COLORS.gray;
            return (
              <button key={o.id} onClick={() => toggleOutcome(o.id)}
                className={`text-left rounded-xl border-2 p-4 transition-all ${
                  sel ? oc.sel : hasMatch
                    ? "border-border bg-card hover:border-border-s hover:shadow-sm"
                    : "border-border bg-card-alt opacity-50"
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${sel ? "bg-white/60 dark:bg-white/10" : "bg-card-alt"}`}>
                    <div className={`w-4 h-4 rounded-full ${sel ? oc.dot : "bg-fg-muted/30"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {sel && <div className="text-xs text-accent font-semibold mb-0.5">✓ Selected</div>}
                    <p className="font-semibold text-sm text-fg leading-snug">{o.title}</p>
                    <p className="text-xs text-fg-dim mt-1 leading-relaxed">{o.description}</p>
                    <p className={`text-xs mt-1.5 ${selectedProducts.length > 0 && hasMatch ? "text-accent font-medium" : "text-fg-muted"}`}>
                      {selectedProducts.length > 0 ? `${matchCount} matching criteria` : `${o.criteriaIds.length} criteria`}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={selectedOutcomes.length === 0} onClick={buildFromOutcomes}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1F3A] text-white font-semibold rounded-xl hover:bg-[#0D2137] disabled:opacity-40 text-sm transition-colors">
            Build success criteria from {selectedOutcomes.length || "…"} objective{selectedOutcomes.length !== 1 ? "s" : ""} →
          </button>
          <button onClick={() => setShowBrowse(true)}
            className="text-sm text-accent hover:text-accent-h underline underline-offset-2 transition-colors">
            Browse full criteria library
          </button>
        </div>
      </div>

      {/* Criteria count + plan list */}
      {planCriteria.length > 0 && (
        <>
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-fg text-sm">{planCriteria.length} criteria selected</h3>
              <button onClick={() => setShowBrowse(true)} className="text-xs text-accent underline">Adjust</button>
            </div>
            {planCriteria.length > 12 && (
              <div className="mt-3 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 flex gap-1.5 items-start">
                ⚠ {planCriteria.length} criteria selected — 5–10 is ideal for a focused evaluation.
              </div>
            )}
          </div>

          <div className="space-y-3">
            {planCriteria.map((id, i) => {
              const c = getCriterion(id);
              if (!c) return null;
              return (
                <CriterionCard
                  key={id}
                  criterion={c as Criterion}
                  idx={i}
                  total={planCriteria.length}
                  onMoveUp={() => moveCriterion(id, "up")}
                  onMoveDown={() => moveCriterion(id, "down")}
                  onRemove={() => removeCriterion(id)}
                  onEditField={(field, value) => editCriterionField(id, field, value)}
                  onReset={() => resetCriterionEdits(id)}
                  hasEdits={!!criteriaEdits[id] && Object.keys(criteriaEdits[id]).length > 0}
                  pillarColors={PILLAR_COLORS}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Add custom criterion */}
      <button onClick={() => setShowAddCustom(true)}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-fg-muted hover:border-accent hover:text-accent hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors text-sm font-medium">
        + Add custom success criterion
      </button>

      {/* Browse modal */}
      {showBrowse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => { if (e.target === e.currentTarget) setShowBrowse(false); }}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-fg">Browse full criteria library</h3>
              <button onClick={() => setShowBrowse(false)} className="p-1 rounded hover:bg-card-alt text-fg-muted hover:text-fg">×</button>
            </div>
            <div className="p-4 border-b border-border flex gap-2">
              <input className={`flex-1 ${inp}`}
                placeholder="Search…" value={browseSearch} onChange={e => setBrowseSearch(e.target.value)} />
              <select className={inp} style={{width:"auto"}}
                value={browseProduct} onChange={e => setBrowseProduct(e.target.value)}>
                <option value="">All products</option>
                {uniqueProducts.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-0.5">
              {filteredBrowse.map(c => {
                const inPlan = planCriteria.includes(c.id);
                return (
                  <label key={c.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-card-alt ${inPlan ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}>
                    <input type="checkbox" checked={inPlan} onChange={() => toggleCriterion(c.id)}
                      className="h-4 w-4 rounded border-border text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-fg-muted shrink-0">{c.id}</span>
                        <span className="text-sm font-medium text-fg truncate">{c.requirement}</span>
                        <span className="text-xs bg-card-alt border border-border rounded px-1.5 text-fg-dim shrink-0">{c.product}</span>
                      </div>
                      <p className="text-xs text-fg-dim truncate mt-0.5">{c.businessProblem}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-fg-muted">{planCriteria.length} in plan</span>
              <button onClick={() => setShowBrowse(false)}
                className="px-4 py-2 bg-accent hover:bg-accent-h text-white text-sm font-medium rounded-lg transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Add custom modal */}
      {showAddCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => { if (e.target === e.currentTarget) setShowAddCustom(false); }}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-fg">Add custom criterion</h3>
              <button onClick={() => setShowAddCustom(false)} className="p-1 rounded hover:bg-card-alt text-fg-muted hover:text-fg">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-fg-muted uppercase mb-1">Product</label>
                  <select className={inp} value={customForm.product}
                    onChange={e => setCustomForm(f => ({ ...f, product: e.target.value }))}>
                    {uniqueProducts.map(p => <option key={p}>{p}</option>)}
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-fg-muted uppercase mb-1">Requirement *</label>
                  <input className={inp} placeholder="e.g. Custom detection capability" value={customForm.requirement}
                    onChange={e => setCustomForm(f => ({ ...f, requirement: e.target.value }))} />
                </div>
              </div>
              {(["businessProblem","successCriteria","measurement","competitiveEdge"] as const).map(k => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-fg-muted uppercase mb-1">{k.replace(/([A-Z])/g, " $1").trim()}</label>
                  <textarea className={inp} rows={2} value={customForm[k]}
                    onChange={e => setCustomForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setShowAddCustom(false)}
                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-card-alt text-fg-dim transition-colors">Cancel</button>
              <button onClick={addCustomCriterion} disabled={!customForm.requirement.trim()}
                className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-h text-white rounded-lg disabled:opacity-40 transition-colors">
                Add to plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => router.push(`/pov/${pov.id}/context`)}
          className="flex items-center gap-2 px-5 py-2.5 border border-border text-fg-dim rounded-xl hover:bg-card-alt text-sm transition-colors">
          ← Back
        </button>
        <button onClick={handleNext} disabled={planCriteria.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0B1F3A] text-white font-semibold rounded-xl hover:bg-[#0D2137] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Start Execution →
        </button>
      </div>
    </div>
  );
}

function CriterionCard({ criterion, idx, total, onMoveUp, onMoveDown, onRemove, onEditField, onReset, hasEdits, pillarColors }: {
  criterion: Criterion;
  idx: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onEditField: (field: string, value: string) => void;
  onReset: () => void;
  hasEdits: boolean;
  pillarColors: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [draft,    setDraft]    = useState({
    requirement:     criterion.requirement,
    businessProblem: criterion.businessProblem,
    successCriteria: criterion.successCriteria,
    measurement:     criterion.measurement,
    competitiveEdge: criterion.competitiveEdge,
  });

  function saveEdits() {
    Object.entries(draft).forEach(([k, v]) => onEditField(k, v));
    setEditing(false);
    setExpanded(false);
  }

  return (
    <div className={`bg-card rounded-xl border-2 shadow-sm ${hasEdits ? "border-amber-300 dark:border-amber-700" : "border-border"}`}>
      <div className="flex items-start gap-2 p-4">
        <div className="flex flex-col items-center gap-0.5 shrink-0 mt-0.5">
          <button onClick={onMoveUp} disabled={idx === 0} className="p-1 text-fg-muted hover:text-fg disabled:opacity-20 rounded text-xs transition-colors">▲</button>
          <span className="text-xs font-mono text-fg-muted">{idx+1}</span>
          <button onClick={onMoveDown} disabled={idx === total-1} className="p-1 text-fg-muted hover:text-fg disabled:opacity-20 rounded text-xs transition-colors">▼</button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-xs font-mono text-fg-muted">{criterion.id}</span>
            <span className="text-xs bg-card-alt border border-border text-fg-dim rounded px-1.5 py-0.5">{criterion.product}</span>
            {hasEdits && <span className="text-xs bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded px-1.5 py-0.5">edited</span>}
            {(criterion.edgeTags ?? []).map(t => (
              <span key={t} className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-medium ${pillarColors[t] ?? "bg-card-alt text-fg-dim border-border"}`}>{t}</span>
            ))}
          </div>
          {editing ? (
            <div className="space-y-2 mt-1">
              {(["requirement","businessProblem","successCriteria","measurement","competitiveEdge"] as const).map(f => (
                <div key={f}>
                  <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-0.5">
                    {f === "requirement" ? "Requirement" : f === "businessProblem" ? "Business Problem" :
                     f === "successCriteria" ? "Success Criteria" : f === "measurement" ? "Measurement" : "Competitive Edge"}
                  </label>
                  <textarea
                    rows={2}
                    value={draft[f]}
                    onChange={e => setDraft(d => ({ ...d, [f]: e.target.value }))}
                    className="w-full border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y bg-card text-fg"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button onClick={saveEdits} className="text-xs bg-accent hover:bg-accent-h text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">Save edits</button>
                <button onClick={() => { setEditing(false); setDraft({ requirement: criterion.requirement, businessProblem: criterion.businessProblem, successCriteria: criterion.successCriteria, measurement: criterion.measurement, competitiveEdge: criterion.competitiveEdge }); }} className="text-xs text-fg-dim px-3 py-1.5 rounded-lg hover:bg-card-alt transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="font-semibold text-fg text-sm leading-snug">{criterion.requirement}</h4>
              <p className="text-xs text-fg-dim italic mt-0.5 leading-relaxed">{criterion.businessProblem}</p>
              {expanded && (
                <div className="mt-3 space-y-2">
                  <div className="bg-card-alt rounded-lg p-3">
                    <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Success Criteria</p>
                    <p className="text-xs text-fg-dim leading-relaxed">{criterion.successCriteria}</p>
                  </div>
                  <div className="bg-card-alt rounded-lg p-3">
                    <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Measurement</p>
                    <p className="text-xs text-fg-dim leading-relaxed">{criterion.measurement}</p>
                  </div>
                  <div className="rounded-lg p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Competitive Edge</p>
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">{criterion.competitiveEdge}</p>
                  </div>
                  {hasEdits && (
                    <button onClick={onReset} className="text-xs text-fg-muted hover:text-red-500 underline transition-colors">Reset to library defaults</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        {!editing && (
          <div className="flex flex-col gap-1 shrink-0">
            <button onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-fg-muted hover:text-fg rounded hover:bg-card-alt text-xs transition-colors">
              {expanded ? "▲" : "▼"}
            </button>
            <button onClick={() => { setEditing(true); setExpanded(false); setDraft({ requirement: criterion.requirement, businessProblem: criterion.businessProblem, successCriteria: criterion.successCriteria, measurement: criterion.measurement, competitiveEdge: criterion.competitiveEdge }); }}
              className="p-1.5 text-fg-muted hover:text-accent rounded hover:bg-blue-50 dark:hover:bg-blue-950/20 text-xs transition-colors" title="Edit this criterion">✎</button>
            <button onClick={onRemove}
              className="p-1.5 text-fg-muted hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-xs transition-colors">✕</button>
          </div>
        )}
      </div>
    </div>
  );
}
