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

const OUTCOME_COLORS: Record<string, { sel: string; icon: string }> = {
  red:    { sel: "border-red-400 bg-red-50",     icon: "text-red-500" },
  purple: { sel: "border-purple-400 bg-purple-50", icon: "text-purple-500" },
  blue:   { sel: "border-blue-400 bg-blue-50",   icon: "text-blue-500" },
  orange: { sel: "border-orange-400 bg-orange-50", icon: "text-orange-500" },
  teal:   { sel: "border-teal-400 bg-teal-50",   icon: "text-teal-500" },
  green:  { sel: "border-green-400 bg-green-50", icon: "text-green-500" },
  amber:  { sel: "border-amber-400 bg-amber-50", icon: "text-amber-500" },
  indigo: { sel: "border-indigo-400 bg-indigo-50", icon: "text-indigo-500" },
  cyan:   { sel: "border-cyan-400 bg-cyan-50",   icon: "text-cyan-500" },
  pink:   { sel: "border-pink-400 bg-pink-50",   icon: "text-pink-500" },
  gray:   { sel: "border-slate-400 bg-slate-50", icon: "text-slate-400" },
};

const PILLAR_COLORS: Record<string, string> = {
  PLATFORM: "bg-blue-100 text-blue-700 border-blue-200",
  NATIVE:   "bg-green-100 text-green-700 border-green-200",
  INTEL:    "bg-purple-100 text-purple-700 border-purple-200",
  AGENTIC:  "bg-orange-100 text-orange-700 border-orange-200",
  PRICING:  "bg-teal-100 text-teal-700 border-teal-200",
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

  const inp = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Success Criteria</h2>
        <SaveIndicator status={status} />
      </div>

      {/* Evaluation Objectives */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-800">Evaluation Objectives</h3>
          <span className="text-sm text-slate-500">{selectedOutcomes.length} selected</span>
        </div>
        <p className="text-sm text-slate-500 mb-4">
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
                    ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    : "border-slate-100 bg-slate-50 opacity-50"
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${sel ? "bg-white/60" : "bg-slate-100"}`}>
                    <div className={`w-4 h-4 rounded-full ${sel ? oc.icon.replace("text-","bg-").replace("-500","-400") : "bg-slate-300"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {sel && <div className="text-xs text-blue-600 font-semibold mb-0.5">✓ Selected</div>}
                    <p className="font-semibold text-sm text-slate-800 leading-snug">{o.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{o.description}</p>
                    <p className={`text-xs mt-1.5 ${selectedProducts.length > 0 && hasMatch ? "text-blue-600 font-medium" : "text-slate-400"}`}>
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
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-40 text-sm">
            Build success criteria from {selectedOutcomes.length || "…"} objective{selectedOutcomes.length !== 1 ? "s" : ""} →
          </button>
          <button onClick={() => setShowBrowse(true)}
            className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2">
            Browse full criteria library
          </button>
        </div>
      </div>

      {/* Criteria count + plan list */}
      {planCriteria.length > 0 && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 text-sm">{planCriteria.length} criteria selected</h3>
              <button onClick={() => setShowBrowse(true)} className="text-xs text-blue-600 underline">Adjust</button>
            </div>
            {planCriteria.length > 12 && (
              <div className="mt-3 text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2 flex gap-1.5 items-start">
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
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium">
        + Add custom success criterion
      </button>

      {/* Browse modal */}
      {showBrowse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) setShowBrowse(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Browse full criteria library</h3>
              <button onClick={() => setShowBrowse(false)} className="p-1 rounded hover:bg-slate-100">×</button>
            </div>
            <div className="p-4 border-b border-slate-100 flex gap-2">
              <input className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                placeholder="Search…" value={browseSearch} onChange={e => setBrowseSearch(e.target.value)} />
              <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                value={browseProduct} onChange={e => setBrowseProduct(e.target.value)}>
                <option value="">All products</option>
                {uniqueProducts.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-0.5">
              {filteredBrowse.map(c => {
                const inPlan = planCriteria.includes(c.id);
                return (
                  <label key={c.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-slate-50 ${inPlan ? "bg-blue-50" : ""}`}>
                    <input type="checkbox" checked={inPlan} onChange={() => toggleCriterion(c.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-400 shrink-0">{c.id}</span>
                        <span className="text-sm font-medium text-slate-800 truncate">{c.requirement}</span>
                        <span className="text-xs bg-slate-100 rounded px-1.5 shrink-0">{c.product}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{c.businessProblem}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm text-slate-500">{planCriteria.length} in plan</span>
              <button onClick={() => setShowBrowse(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Add custom modal */}
      {showAddCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) setShowAddCustom(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Add custom criterion</h3>
              <button onClick={() => setShowAddCustom(false)} className="p-1 rounded hover:bg-slate-100">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Product</label>
                  <select className={inp} value={customForm.product}
                    onChange={e => setCustomForm(f => ({ ...f, product: e.target.value }))}>
                    {uniqueProducts.map(p => <option key={p}>{p}</option>)}
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Requirement *</label>
                  <input className={inp} placeholder="e.g. Custom detection capability" value={customForm.requirement}
                    onChange={e => setCustomForm(f => ({ ...f, requirement: e.target.value }))} />
                </div>
              </div>
              {(["businessProblem","successCriteria","measurement","competitiveEdge"] as const).map(k => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{k.replace(/([A-Z])/g, " $1").trim()}</label>
                  <textarea className={inp} rows={2} value={customForm[k]}
                    onChange={e => setCustomForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowAddCustom(false)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={addCustomCriterion} disabled={!customForm.requirement.trim()}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40">
                Add to plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => router.push(`/pov/${pov.id}/context`)}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 text-sm">
          ← Back
        </button>
        <button onClick={handleNext} disabled={planCriteria.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
          Start Execution →
        </button>
      </div>
    </div>
  );
}

// Sub-component: individual criterion card
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
    <div className={`bg-white rounded-xl border-2 shadow-sm ${hasEdits ? "border-amber-300" : "border-slate-200"}`}>
      <div className="flex items-start gap-2 p-4">
        <div className="flex flex-col items-center gap-0.5 shrink-0 mt-0.5">
          <button onClick={onMoveUp} disabled={idx === 0} className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-20 rounded text-xs">▲</button>
          <span className="text-xs font-mono text-slate-300">{idx+1}</span>
          <button onClick={onMoveDown} disabled={idx === total-1} className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-20 rounded text-xs">▼</button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-xs font-mono text-slate-300">{criterion.id}</span>
            <span className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{criterion.product}</span>
            {hasEdits && <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">edited</span>}
            {(criterion.edgeTags ?? []).map(t => (
              <span key={t} className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-medium ${pillarColors[t] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>{t}</span>
            ))}
          </div>
          {editing ? (
            <div className="space-y-2 mt-1">
              {(["requirement","businessProblem","successCriteria","measurement","competitiveEdge"] as const).map(f => (
                <div key={f}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                    {f === "requirement" ? "Requirement" : f === "businessProblem" ? "Business Problem" :
                     f === "successCriteria" ? "Success Criteria" : f === "measurement" ? "Measurement" : "Competitive Edge"}
                  </label>
                  <textarea
                    rows={2}
                    value={draft[f]}
                    onChange={e => setDraft(d => ({ ...d, [f]: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button onClick={saveEdits} className="text-xs bg-[#0049BD] text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700">Save edits</button>
                <button onClick={() => { setEditing(false); setDraft({ requirement: criterion.requirement, businessProblem: criterion.businessProblem, successCriteria: criterion.successCriteria, measurement: criterion.measurement, competitiveEdge: criterion.competitiveEdge }); }} className="text-xs text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="font-semibold text-slate-800 text-sm leading-snug">{criterion.requirement}</h4>
              <p className="text-xs text-slate-500 italic mt-0.5 leading-relaxed">{criterion.businessProblem}</p>
              {expanded && (
                <div className="mt-3 space-y-2">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Success Criteria</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{criterion.successCriteria}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Measurement</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{criterion.measurement}</p>
                  </div>
                  <div className="rounded-lg p-3 bg-amber-50 border border-amber-200">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Competitive Edge</p>
                    <p className="text-xs text-amber-900 leading-relaxed">{criterion.competitiveEdge}</p>
                  </div>
                  {hasEdits && (
                    <button onClick={onReset} className="text-xs text-slate-400 hover:text-red-500 underline">Reset to library defaults</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        {!editing && (
          <div className="flex flex-col gap-1 shrink-0">
            <button onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-slate-300 hover:text-slate-600 rounded hover:bg-slate-100 text-xs">
              {expanded ? "▲" : "▼"}
            </button>
            <button onClick={() => { setEditing(true); setExpanded(false); setDraft({ requirement: criterion.requirement, businessProblem: criterion.businessProblem, successCriteria: criterion.successCriteria, measurement: criterion.measurement, competitiveEdge: criterion.competitiveEdge }); }}
              className="p-1.5 text-slate-300 hover:text-blue-500 rounded hover:bg-blue-50 text-xs" title="Edit this criterion">✎</button>
            <button onClick={onRemove}
              className="p-1.5 text-slate-300 hover:text-red-500 rounded hover:bg-red-50 text-xs">✕</button>
          </div>
        )}
      </div>
    </div>
  );
}
