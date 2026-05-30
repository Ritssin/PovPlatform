"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Criterion = {
  id: string; product: string; requirement: string; businessProblem: string;
  successCriteria: string; measurement: string; competitiveEdge: string;
  edgeTags: string[]; active: boolean; sortOrder: number;
};

type Outcome = {
  id: string; icon: string; color: string; title: string; description: string;
  criteriaIds: string[]; active: boolean; sortOrder: number;
};

type Pillar = { tag: string; name: string; what: string; vsCompetitors: string; active: boolean; };

type LibItem = { id: string; type: string; text: string; sortOrder: number; active: boolean; meta: unknown; };

interface Props {
  initialCriteria:  Criterion[];
  initialOutcomes:  Outcome[];
  initialPillars:   Pillar[];
  initialDrivers:   LibItem[];
  initialRisks:     LibItem[];
  initialActions:   LibItem[];
  initialProducts:  LibItem[];
  initialIndustries: LibItem[];
}

const TABS = ["Criteria", "Outcomes", "Pillars", "Drivers", "Risks", "Actions", "Products", "Industries"] as const;
type Tab = typeof TABS[number];

const PRODUCTS_LIST = ["XDR", "MDR", "Endpoint", "Firewall", "Email", "ZTNA", "NDR", "ITDR", "Workspace"];
const PILLAR_TAGS   = ["PLATFORM", "NATIVE", "INTEL", "AGENTIC", "PRICING"];

// ── Root component ────────────────────────────────────────────────────────────

export default function LibraryClient({
  initialCriteria, initialOutcomes, initialPillars,
  initialDrivers, initialRisks, initialActions, initialProducts, initialIndustries,
}: Props) {
  const [tab, setTab]             = useState<Tab>("Criteria");
  const [criteria, setCriteria]   = useState(initialCriteria);
  const [outcomes, setOutcomes]   = useState(initialOutcomes);
  const [pillars, setPillars]     = useState(initialPillars);
  const [drivers, setDrivers]     = useState(initialDrivers);
  const [risks, setRisks]         = useState(initialRisks);
  const [actions, setActions]     = useState(initialActions);
  const [products, setProducts]   = useState(initialProducts);
  const [industries, setIndustries] = useState(initialIndustries);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
              tab === t
                ? "bg-white border border-b-white border-slate-200 text-blue-600 -mb-px"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Criteria"   && <CriteriaTab   criteria={criteria}   setCriteria={setCriteria} />}
      {tab === "Outcomes"   && <OutcomesTab   outcomes={outcomes}   setOutcomes={setOutcomes} allCriteria={criteria} />}
      {tab === "Pillars"    && <PillarsTab    pillars={pillars}     setPillars={setPillars} />}
      {tab === "Drivers"    && <SimpleItemTab type="DRIVER"     items={drivers}    setItems={setDrivers} />}
      {tab === "Risks"      && <SimpleItemTab type="RISK"       items={risks}      setItems={setRisks} />}
      {tab === "Actions"    && <SimpleItemTab type="ACTION"     items={actions}    setItems={setActions} />}
      {tab === "Products"   && <SimpleItemTab type="PRODUCT"    items={products}   setItems={setProducts} />}
      {tab === "Industries" && <SimpleItemTab type="INDUSTRY"   items={industries} setItems={setIndustries} />}
    </div>
  );
}

// ── Criteria Tab ──────────────────────────────────────────────────────────────

function CriteriaTab({ criteria, setCriteria }: { criteria: Criterion[]; setCriteria: (c: Criterion[]) => void }) {
  const [search,      setSearch]      = useState("");
  const [product,     setProduct]     = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [expandId,    setExpandId]    = useState<string | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [saving,      setSaving]      = useState<string | null>(null);
  const [editData,    setEditData]    = useState<Partial<Criterion>>({});
  const [newData,     setNewData]     = useState<Partial<Criterion>>({ edgeTags: [] });

  const filtered = criteria.filter(c => {
    if (!showInactive && !c.active) return false;
    if (product && c.product !== product) return false;
    if (search && !c.requirement.toLowerCase().includes(search.toLowerCase()) &&
        !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function save(id: string, data: Partial<Criterion>) {
    setSaving(id);
    const res = await fetch(`/api/library/criteria/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setCriteria(criteria.map(c => c.id === id ? updated : c));
    }
    setSaving(null);
    setExpandId(null);
  }

  async function toggleActive(c: Criterion) {
    await save(c.id, { active: !c.active });
  }

  async function addCriterion() {
    const res = await fetch("/api/library/criteria", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newData),
    });
    if (res.ok) {
      const created = await res.json();
      setCriteria([...criteria, created]);
      setNewData({ edgeTags: [] });
      setShowAdd(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search ID or requirement…"
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
        />
        <select
          value={product} onChange={e => setProduct(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All products</option>
          {PRODUCTS_LIST.map(p => <option key={p}>{p}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="rounded" />
          Show inactive
        </label>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} criteria</span>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-[#0049BD] hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          + Add criterion
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">New criterion</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ID (e.g. XDR-08)" value={newData.id ?? ""} onChange={v => setNewData(d => ({...d, id: v}))} />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Product</label>
              <select value={newData.product ?? ""} onChange={e => setNewData(d => ({...d, product: e.target.value}))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">Select…</option>
                {PRODUCTS_LIST.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <Field label="Requirement" value={newData.requirement ?? ""} onChange={v => setNewData(d => ({...d, requirement: v}))} />
          <TextAreaField label="Business Problem" value={newData.businessProblem ?? ""} onChange={v => setNewData(d => ({...d, businessProblem: v}))} />
          <TextAreaField label="Success Criteria" value={newData.successCriteria ?? ""} onChange={v => setNewData(d => ({...d, successCriteria: v}))} />
          <Field label="Measurement" value={newData.measurement ?? ""} onChange={v => setNewData(d => ({...d, measurement: v}))} />
          <Field label="Competitive Edge" value={newData.competitiveEdge ?? ""} onChange={v => setNewData(d => ({...d, competitiveEdge: v}))} />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Edge Tags</label>
            <div className="flex flex-wrap gap-2">
              {PILLAR_TAGS.map(tag => (
                <label key={tag} className="flex items-center gap-1 text-xs cursor-pointer">
                  <input type="checkbox"
                    checked={(newData.edgeTags ?? []).includes(tag)}
                    onChange={e => setNewData(d => ({
                      ...d,
                      edgeTags: e.target.checked
                        ? [...(d.edgeTags ?? []), tag]
                        : (d.edgeTags ?? []).filter(t => t !== tag),
                    }))}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addCriterion} className="bg-[#0049BD] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Save</button>
            <button onClick={() => setShowAdd(false)} className="text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-100">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase w-20">ID</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase w-24">Product</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Requirement</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase w-24">Tags</th>
              <th className="px-4 py-2 w-32" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(c => (
              <>
                <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${!c.active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{c.id}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-medium">{c.product}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-800">{c.requirement}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {c.edgeTags.map(t => <span key={t} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{t}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    <button
                      onClick={() => { setExpandId(expandId === c.id ? null : c.id); setEditData({...c}); }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(c)}
                      disabled={saving === c.id}
                      className={`text-xs font-medium ${c.active ? "text-slate-400 hover:text-red-600" : "text-emerald-600 hover:text-emerald-800"}`}
                    >
                      {c.active ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
                {expandId === c.id && (
                  <tr key={`${c.id}-edit`}>
                    <td colSpan={5} className="px-4 py-4 bg-slate-50">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Product</label>
                            <select value={editData.product ?? ""} onChange={e => setEditData(d => ({...d, product: e.target.value}))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                              {PRODUCTS_LIST.map(p => <option key={p}>{p}</option>)}
                            </select>
                          </div>
                          <Field label="Sort order" value={String(editData.sortOrder ?? 0)} onChange={v => setEditData(d => ({...d, sortOrder: Number(v)}))} type="number" />
                        </div>
                        <Field label="Requirement" value={editData.requirement ?? ""} onChange={v => setEditData(d => ({...d, requirement: v}))} />
                        <TextAreaField label="Business Problem" value={editData.businessProblem ?? ""} onChange={v => setEditData(d => ({...d, businessProblem: v}))} />
                        <TextAreaField label="Success Criteria" value={editData.successCriteria ?? ""} onChange={v => setEditData(d => ({...d, successCriteria: v}))} />
                        <Field label="Measurement" value={editData.measurement ?? ""} onChange={v => setEditData(d => ({...d, measurement: v}))} />
                        <TextAreaField label="Competitive Edge" value={editData.competitiveEdge ?? ""} onChange={v => setEditData(d => ({...d, competitiveEdge: v}))} />
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Edge Tags</label>
                          <div className="flex flex-wrap gap-3">
                            {PILLAR_TAGS.map(tag => (
                              <label key={tag} className="flex items-center gap-1 text-xs cursor-pointer">
                                <input type="checkbox"
                                  checked={(editData.edgeTags ?? []).includes(tag)}
                                  onChange={e => setEditData(d => ({
                                    ...d,
                                    edgeTags: e.target.checked
                                      ? [...(d.edgeTags ?? []), tag]
                                      : (d.edgeTags ?? []).filter(t => t !== tag),
                                  }))}
                                />
                                {tag}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => save(c.id, editData)}
                            disabled={saving === c.id}
                            className="bg-[#0049BD] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving === c.id ? "Saving…" : "Save changes"}
                          </button>
                          <button onClick={() => setExpandId(null)} className="text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-100">Cancel</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Outcomes Tab ──────────────────────────────────────────────────────────────

const COLOR_OPTIONS = ["red","purple","blue","orange","teal","green","amber","indigo","cyan","pink","gray"];

function OutcomesTab({
  outcomes, setOutcomes, allCriteria,
}: { outcomes: Outcome[]; setOutcomes: (o: Outcome[]) => void; allCriteria: Criterion[] }) {
  const [editId,   setEditId]   = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Outcome>>({});
  const [saving,   setSaving]   = useState<string | null>(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [addError, setAddError] = useState("");
  const blankOutcome = () => ({ id: "", title: "", icon: "", color: "blue", description: "", criteriaIds: [] as string[] });
  const [newData,  setNewData]  = useState<Partial<Outcome>>(blankOutcome());

  async function save(id: string, data: Partial<Outcome>) {
    setSaving(id);
    const res = await fetch(`/api/library/outcomes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setOutcomes(outcomes.map(o => o.id === id ? updated : o));
    }
    setSaving(null);
    setEditId(null);
  }

  async function addOutcome() {
    setAddError("");
    if (!newData.id?.trim() || !newData.title?.trim()) { setAddError("ID and Title are required."); return; }
    setSaving("__new__");
    const res = await fetch("/api/library/outcomes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newData, sortOrder: outcomes.length }),
    });
    if (res.status === 409) { setAddError("An outcome with this ID already exists."); setSaving(null); return; }
    if (res.ok) {
      const created = await res.json();
      setOutcomes([...outcomes, created]);
      setNewData(blankOutcome());
      setShowAdd(false);
    }
    setSaving(null);
  }

  return (
    <div className="space-y-4">
      {/* Header + Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => { setShowAdd(!showAdd); setAddError(""); setNewData(blankOutcome()); }}
          className="bg-[#0049BD] hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          + Add outcome
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">New outcome</h3>
          {addError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">{addError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="ID (slug, e.g. ransomware)" value={newData.id ?? ""} onChange={v => setNewData(d => ({...d, id: v.toLowerCase().replace(/\s+/g,"-")}))} />
            <Field label="Title" value={newData.title ?? ""} onChange={v => setNewData(d => ({...d, title: v}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Icon (emoji)" value={newData.icon ?? ""} onChange={v => setNewData(d => ({...d, icon: v}))} />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
              <select value={newData.color ?? "blue"} onChange={e => setNewData(d => ({...d, color: e.target.value}))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <TextAreaField label="Description" value={newData.description ?? ""} onChange={v => setNewData(d => ({...d, description: v}))} />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Linked criteria ({(newData.criteriaIds ?? []).length})</label>
            <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 bg-white">
              {allCriteria.filter(c => c.active).map(c => (
                <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 rounded px-1">
                  <input type="checkbox"
                    checked={(newData.criteriaIds ?? []).includes(c.id)}
                    onChange={e => setNewData(d => ({
                      ...d,
                      criteriaIds: e.target.checked
                        ? [...(d.criteriaIds ?? []), c.id]
                        : (d.criteriaIds ?? []).filter(id => id !== c.id),
                    }))}
                  />
                  <span className="font-mono text-slate-500">{c.id}</span>
                  <span className="text-slate-700 truncate">{c.requirement}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={addOutcome} disabled={saving === "__new__"}
              className="bg-[#0049BD] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving === "__new__" ? "Saving…" : "Save outcome"}
            </button>
            <button onClick={() => { setShowAdd(false); setAddError(""); }} className="text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-100">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {outcomes.map(o => (
        <div key={o.id} className={`bg-white rounded-xl border border-slate-200 p-4 ${!o.active ? "opacity-50" : ""}`}>
          {editId === o.id ? (
            <div className="space-y-2">
              <Field label="Title" value={editData.title ?? ""} onChange={v => setEditData(d => ({...d, title: v}))} />
              <TextAreaField label="Description" value={editData.description ?? ""} onChange={v => setEditData(d => ({...d, description: v}))} />
              <Field label="Icon (emoji)" value={editData.icon ?? ""} onChange={v => setEditData(d => ({...d, icon: v}))} />
              <Field label="Color class (e.g. blue)" value={editData.color ?? ""} onChange={v => setEditData(d => ({...d, color: v}))} />
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Linked criteria ({(editData.criteriaIds ?? []).length})</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {allCriteria.filter(c => c.active).map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 rounded px-1">
                      <input type="checkbox"
                        checked={(editData.criteriaIds ?? []).includes(c.id)}
                        onChange={e => setEditData(d => ({
                          ...d,
                          criteriaIds: e.target.checked
                            ? [...(d.criteriaIds ?? []), c.id]
                            : (d.criteriaIds ?? []).filter(id => id !== c.id),
                        }))}
                      />
                      <span className="font-mono text-slate-500">{c.id}</span>
                      <span className="text-slate-700 truncate">{c.requirement}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => save(o.id, editData)} disabled={saving === o.id}
                  className="bg-[#0049BD] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving === o.id ? "…" : "Save"}
                </button>
                <button onClick={() => setEditId(null)} className="text-slate-500 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{o.icon}</span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{o.title}</p>
                  <p className="text-xs text-slate-500 font-mono">{o.id}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-3">{o.description}</p>
              <p className="text-xs text-slate-400">{o.criteriaIds.length} criteria linked</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setEditId(o.id); setEditData({...o}); }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >Edit</button>
                <button
                  onClick={() => save(o.id, { active: !o.active })}
                  className={`text-xs font-medium ${o.active ? "text-slate-400 hover:text-red-600" : "text-emerald-600 hover:text-emerald-800"}`}
                >
                  {o.active ? "Deactivate" : "Reactivate"}
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

// ── Pillars Tab ───────────────────────────────────────────────────────────────

function PillarsTab({ pillars, setPillars }: { pillars: Pillar[]; setPillars: (p: Pillar[]) => void }) {
  const [expandTag, setExpandTag] = useState<string | null>(null);
  const [editData,  setEditData]  = useState<Partial<Pillar>>({});
  const [saving,    setSaving]    = useState<string | null>(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [addError,  setAddError]  = useState("");
  const [newPillar, setNewPillar] = useState({ tag: "", name: "", what: "", vsCompetitors: "" });

  async function save(tag: string, data: Partial<Pillar>) {
    setSaving(tag);
    const res = await fetch(`/api/library/pillars/${tag}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setPillars(pillars.map(p => p.tag === tag ? updated : p));
    }
    setSaving(null);
    setExpandTag(null);
  }

  async function addPillar() {
    setAddError("");
    if (!newPillar.tag.trim() || !newPillar.name.trim()) { setAddError("Tag and Name are required."); return; }
    setSaving("__new__");
    const res = await fetch("/api/library/pillars", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newPillar),
    });
    if (res.status === 409) { setAddError("A pillar with this tag already exists."); setSaving(null); return; }
    if (res.ok) {
      const created = await res.json();
      setPillars([...pillars, created]);
      setNewPillar({ tag: "", name: "", what: "", vsCompetitors: "" });
      setShowAdd(false);
    }
    setSaving(null);
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => { setShowAdd(!showAdd); setAddError(""); setNewPillar({ tag: "", name: "", what: "", vsCompetitors: "" }); }}
          className="bg-[#0049BD] hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          + Add pillar
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">New pillar</h3>
          {addError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">{addError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tag (e.g. PLATFORM)</label>
              <input
                value={newPillar.tag}
                onChange={e => setNewPillar(d => ({...d, tag: e.target.value.toUpperCase()}))}
                placeholder="MYTAG"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Field label="Name" value={newPillar.name} onChange={v => setNewPillar(d => ({...d, name: v}))} />
          </div>
          <TextAreaField label="What it means" value={newPillar.what} onChange={v => setNewPillar(d => ({...d, what: v}))} rows={3} />
          <TextAreaField label="vs Competitors" value={newPillar.vsCompetitors} onChange={v => setNewPillar(d => ({...d, vsCompetitors: v}))} rows={3} />
          <div className="flex gap-2 pt-1">
            <button onClick={addPillar} disabled={saving === "__new__"}
              className="bg-[#0049BD] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving === "__new__" ? "Saving…" : "Save pillar"}
            </button>
            <button onClick={() => { setShowAdd(false); setAddError(""); }} className="text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-100">Cancel</button>
          </div>
        </div>
      )}

    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase w-28">Tag</th>
            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Name</th>
            <th className="px-4 py-2 w-24" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pillars.map(p => (
            <>
              <tr key={p.tag} className={`hover:bg-slate-50 ${!p.active ? "opacity-50" : ""}`}>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{p.tag}</td>
                <td className="px-4 py-2.5 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-2.5 text-right space-x-2">
                  <button
                    onClick={() => { setExpandTag(expandTag === p.tag ? null : p.tag); setEditData({...p}); }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >Edit</button>
                  <button
                    onClick={() => save(p.tag, { active: !p.active })}
                    className={`text-xs font-medium ${p.active ? "text-slate-400 hover:text-red-600" : "text-emerald-600"}`}
                  >{p.active ? "Deactivate" : "Reactivate"}</button>
                </td>
              </tr>
              {expandTag === p.tag && (
                <tr key={`${p.tag}-edit`}>
                  <td colSpan={3} className="px-4 py-4 bg-slate-50">
                    <div className="space-y-3 max-w-2xl">
                      <Field label="Name" value={editData.name ?? ""} onChange={v => setEditData(d => ({...d, name: v}))} />
                      <TextAreaField label="What it means" value={editData.what ?? ""} onChange={v => setEditData(d => ({...d, what: v}))} rows={4} />
                      <TextAreaField label="vs Competitors" value={editData.vsCompetitors ?? ""} onChange={v => setEditData(d => ({...d, vsCompetitors: v}))} rows={4} />
                      <div className="flex gap-2">
                        <button onClick={() => save(p.tag, editData)} disabled={saving === p.tag}
                          className="bg-[#0049BD] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                          {saving === p.tag ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => setExpandTag(null)} className="text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-100">Cancel</button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

// ── Simple Item Tab (Drivers / Risks / Actions / Products / Industries) ───────

function SimpleItemTab({
  type, items, setItems,
}: { type: string; items: LibItem[]; setItems: (i: LibItem[]) => void }) {
  const [showInactive, setShowInactive] = useState(false);
  const [editId,       setEditId]       = useState<string | null>(null);
  const [editText,     setEditText]     = useState("");
  const [newText,      setNewText]      = useState("");
  const [saving,       setSaving]       = useState<string | null>(null);

  const visible = items.filter(i => showInactive || i.active);

  async function update(id: string, data: Partial<LibItem>) {
    setSaving(id);
    const res = await fetch(`/api/library/items/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(items.map(i => i.id === id ? updated : i));
    }
    setSaving(null);
    setEditId(null);
  }

  async function addItem() {
    if (!newText.trim()) return;
    const res = await fetch("/api/library/items", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, text: newText.trim(), sortOrder: items.length }),
    });
    if (res.ok) {
      const created = await res.json();
      setItems([...items, created]);
      setNewText("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          value={newText} onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem()}
          placeholder={`Add new ${type.toLowerCase()} item…`}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 max-w-md"
        />
        <button onClick={addItem}
          className="bg-[#0049BD] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">
          Add
        </button>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer ml-auto">
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="rounded" />
          Show inactive
        </label>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Text</th>
              <th className="px-4 py-2 w-32" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map(item => (
              <tr key={item.id} className={`hover:bg-slate-50 ${!item.active ? "opacity-50" : ""}`}>
                <td className="px-4 py-2.5">
                  {editId === item.id ? (
                    <input
                      value={editText} onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") update(item.id, { text: editText }); if (e.key === "Escape") setEditId(null); }}
                      autoFocus
                      className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ) : (
                    <span className="text-slate-800">{item.text}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right space-x-2">
                  {editId === item.id ? (
                    <>
                      <button onClick={() => update(item.id, { text: editText })} disabled={saving === item.id}
                        className="text-xs text-blue-600 font-medium">
                        {saving === item.id ? "…" : "Save"}
                      </button>
                      <button onClick={() => setEditId(null)} className="text-xs text-slate-400">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(item.id); setEditText(item.text); }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                      <button onClick={() => update(item.id, { active: !item.active })}
                        className={`text-xs font-medium ${item.active ? "text-slate-400 hover:text-red-600" : "text-emerald-600 hover:text-emerald-800"}`}>
                        {item.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400 text-sm">No items yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Shared form helpers ───────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
    </div>
  );
}
