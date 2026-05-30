"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { PoV } from "@prisma/client";
import { useAutoSave, SaveIndicator } from "./AutoSave";
import type { DriverItem, RiskItem, Milestone } from "@/types/pov";

interface Props {
  pov: PoV;
  commonDrivers: string[];
  commonRisks: string[];
  industries: string[];
  products: string[];
}

const SCORE_LABELS: [keyof PoV & `score${string}`, string][] = [
  ["scoreExecutive",   "Executive sponsor identified"],
  ["scoreUseCase",     "Use cases clearly defined"],
  ["scoreUrgency",     "Timeline urgency"],
  ["scoreCompetition", "Urgency to act"],
  ["scoreReadiness",   "Deployment readiness"],
  ["scoreAlignment",   "Technical alignment"],
];

const OPP_VALUES = ["$0–50k","$50–100k","$100–200k","$200–300k","$300–500k",">$500k"];

function qualScore(s: Record<string, number>) {
  return s.scoreExecutive*4 + s.scoreUseCase*4 + s.scoreUrgency*3 +
         s.scoreCompetition*3 + s.scoreReadiness*3 + s.scoreAlignment*3;
}

export default function BusinessContextForm({ pov, commonDrivers, commonRisks, industries, products }: Props) {
  const router = useRouter();
  const { save, saveImmediate, status } = useAutoSave(pov.id);

  const [fields, setFields] = useState({
    customerName:     pov.customerName,
    customerIndustry: pov.customerIndustry,
    salesEngineer:    (pov as unknown as Record<string,string>).salesEngineer ?? "",
    partnerName:      pov.partnerName,
    executiveSponsor: pov.executiveSponsor,
    opportunityValue: pov.opportunityValue,
    ownerType:        pov.ownerType,
  });
  const [scores, setScores] = useState({
    scoreExecutive:   pov.scoreExecutive,
    scoreUseCase:     pov.scoreUseCase,
    scoreUrgency:     pov.scoreUrgency,
    scoreCompetition: pov.scoreCompetition,
    scoreReadiness:   pov.scoreReadiness,
    scoreAlignment:   pov.scoreAlignment,
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>((pov.selectedProducts as unknown as string[]) ?? []);
  const [driverItems, setDriverItems]           = useState<DriverItem[]>((pov.driverItems as unknown as DriverItem[]) ?? []);
  const [businessDrivers, setBusinessDrivers]   = useState(pov.businessDrivers ?? "");
  const [riskItems, setRiskItems]               = useState<RiskItem[]>((pov.riskItems as unknown as RiskItem[]) ?? []);
  const toDateString = (d: Date | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";
  const [startDate, setStartDate] = useState(toDateString(pov.povStartDate));
  const [endDate,   setEndDate]   = useState(toDateString(pov.povEndDate));

  const [milestones, setMilestones]             = useState<Milestone[]>((pov.milestones as unknown as Milestone[]) ?? [
    { id: 1, week: "Week 1", activity: "Deployment and onboarding" },
    { id: 2, week: "Week 2", activity: "Use case validation" },
    { id: 3, week: "Week 3", activity: "Executive review and outcome" },
  ]);
  const [customDriver, setCustomDriver] = useState("");
  const [customRisk,   setCustomRisk]   = useState("");

  const score = qualScore(scores);
  const proceed = score >= 70;

  const updateField = useCallback((k: string, v: string) => {
    setFields(f => ({ ...f, [k]: v }));
    save({ [k]: v });
  }, [save]);

  const updateScore = useCallback((k: string, v: number) => {
    setScores(s => ({ ...s, [k]: v }));
    save({ [k]: v });
  }, [save]);

  const toggleProduct = (p: string) => {
    const next = selectedProducts.includes(p)
      ? selectedProducts.filter(x => x !== p)
      : [...selectedProducts, p];
    setSelectedProducts(next);
    save({ selectedProducts: next });
  };

  const toggleDriver = (text: string) => {
    const active = driverItems.find(d => d.text === text);
    const next = active
      ? driverItems.filter(d => d.text !== text)
      : [...driverItems, { id: Date.now(), text }];
    setDriverItems(next);
    save({ driverItems: next });
  };

  const addDriver = () => {
    const t = customDriver.trim();
    if (!t) return;
    const next = [...driverItems, { id: Date.now(), text: t }];
    setDriverItems(next);
    setCustomDriver("");
    save({ driverItems: next });
  };

  const removeDriver = (id: number) => {
    const next = driverItems.filter(d => d.id !== id);
    setDriverItems(next);
    save({ driverItems: next });
  };

  const toggleRisk = (text: string) => {
    const active = riskItems.find(r => r.text === text);
    const next = active
      ? riskItems.filter(r => r.text !== text)
      : [...riskItems, { id: Date.now(), text }];
    setRiskItems(next);
    save({ riskItems: next });
  };

  const addRisk = () => {
    const t = customRisk.trim();
    if (!t) return;
    const next = [...riskItems, { id: Date.now(), text: t }];
    setRiskItems(next);
    setCustomRisk("");
    save({ riskItems: next });
  };

  const removeRisk = (id: number) => {
    const next = riskItems.filter(r => r.id !== id);
    setRiskItems(next);
    save({ riskItems: next });
  };

  const addMilestone = () => {
    const n = milestones.length + 1;
    const next = [...milestones, { id: Date.now(), week: `Week ${n}`, activity: "" }];
    setMilestones(next);
    save({ milestones: next });
  };

  const updateMilestone = (id: number, k: "week" | "activity", v: string) => {
    const next = milestones.map(m => m.id === id ? { ...m, [k]: v } : m);
    setMilestones(next);
    save({ milestones: next });
  };

  const removeMilestone = (id: number) => {
    const next = milestones.filter(m => m.id !== id);
    setMilestones(next);
    save({ milestones: next });
  };

  async function handleNext() {
    await saveImmediate({ selectedProducts, driverItems, riskItems, milestones, businessDrivers });
    router.push(`/pov/${pov.id}/criteria`);
  }

  const inp = "w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white";
  const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Business Context</h2>
        <SaveIndicator status={status} />
      </div>

      {/* Engagement Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-4">Engagement Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            ["Customer Name", "customerName", "Acme Corp"],
            ["Industry",      "customerIndustry", ""],
            ["Sophos Contact","salesEngineer", "Your name"],
            ["Partner Name",  "partnerName", "Optional"],
            ["Executive Sponsor","executiveSponsor","CISO, CTO…"],
          ].map(([label, key, placeholder]) => (
            <div key={key}>
              <label className={lbl}>{label}</label>
              {key === "customerIndustry" ? (
                <select className={inp} value={(fields as Record<string,string>)[key]} onChange={e => updateField(key, e.target.value)}>
                  <option value="">Select industry…</option>
                  {industries.map(i => <option key={i}>{i}</option>)}
                </select>
              ) : (
                <input className={inp} placeholder={placeholder} value={(fields as Record<string,string>)[key]}
                  onChange={e => updateField(key, e.target.value)} />
              )}
            </div>
          ))}
          <div>
            <label className={lbl}>Estimated Value</label>
            <select className={inp} value={fields.opportunityValue} onChange={e => updateField("opportunityValue", e.target.value)}>
              <option value="">Select range…</option>
              {OPP_VALUES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>PoV Start Date</label>
            <input
              type="date"
              className={inp}
              value={startDate}
              onChange={e => { setStartDate(e.target.value); save({ povStartDate: e.target.value || null }); }}
            />
          </div>
          <div>
            <label className={lbl}>PoV End Date</label>
            <input
              type="date"
              className={inp}
              value={endDate}
              onChange={e => { setEndDate(e.target.value); save({ povEndDate: e.target.value || null }); }}
            />
          </div>
        </div>
      </div>

      {/* Business Drivers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-1">Business Context & Goals</h3>
        <p className="text-xs text-slate-500 mb-3">Select common drivers or add your own.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {commonDrivers.map(d => {
            const active = driverItems.some(x => x.text === d);
            return (
              <button key={d} onClick={() => toggleDriver(d)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  active ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-300 text-slate-600 hover:border-slate-900"
                }`}>
                {active && "✓ "}{d}
              </button>
            );
          })}
        </div>
        {driverItems.filter(d => !commonDrivers.includes(d.text)).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {driverItems.filter(d => !commonDrivers.includes(d.text)).map(d => (
              <span key={d.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                {d.text}
                <button onClick={() => removeDriver(d.id)} className="text-slate-400 hover:text-red-500 ml-0.5">×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mb-4">
          <input value={customDriver} onChange={e => setCustomDriver(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addDriver()}
            placeholder="Custom business driver or goal…"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={addDriver} disabled={!customDriver.trim()}
            className="px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 disabled:opacity-40">
            Add
          </button>
        </div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Additional context <span className="font-normal normal-case text-slate-400">(optional)</span>
        </label>
        <textarea rows={3} value={businessDrivers}
          onChange={e => { setBusinessDrivers(e.target.value); save({ businessDrivers: e.target.value }); }}
          placeholder="Additional detail on the customer's situation and key challenges…"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      {/* Products in scope */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-1">Solutions Being Evaluated</h3>
        <p className="text-sm text-slate-500 mb-3">Select products — this filters the criteria library in the next step.</p>
        <div className="flex flex-wrap gap-2">
          {products.map(p => {
            const sel = selectedProducts.includes(p);
            return (
              <button key={p} onClick={() => toggleProduct(p)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  sel ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-300 hover:border-slate-900"
                }`}>
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Engagement Readiness (scorecard) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Engagement Readiness</h3>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${proceed ? "text-emerald-600" : "text-amber-600"}`}>{score}/90</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${proceed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {proceed ? "Ready to proceed" : "Under review"}
            </span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {SCORE_LABELS.map(([key, title]) => (
            <div key={key} className="bg-slate-50 rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{title}</span>
                <span className="text-sm font-bold bg-white border border-slate-200 rounded-full px-2.5 py-0.5">
                  {(scores as Record<string, number>)[key]}/5
                </span>
              </div>
              <input type="range" min="1" max="5"
                value={(scores as Record<string, number>)[key]}
                onChange={e => updateScore(key, Number(e.target.value))}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Weak</span><span>Strong</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-4">Evaluation Timeline</h3>
        <div className="space-y-2 mb-3">
          {milestones.map(m => (
            <div key={m.id} className="flex items-center gap-2">
              <input value={m.week} onChange={e => updateMilestone(m.id, "week", e.target.value)}
                className="w-28 shrink-0 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Week 1" />
              <input value={m.activity} onChange={e => updateMilestone(m.id, "activity", e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Activity…" />
              <button onClick={() => removeMilestone(m.id)}
                className="shrink-0 p-1.5 text-slate-300 hover:text-red-500 rounded hover:bg-red-50">×</button>
            </div>
          ))}
        </div>
        <button onClick={addMilestone} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          + Add milestone
        </button>
      </div>

      {/* Assumptions & Dependencies */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-1">Assumptions & Dependencies</h3>
        <p className="text-xs text-slate-500 mb-3">Select common risks or add custom ones.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonRisks.map(r => {
            const active = riskItems.some(x => x.text === r);
            return (
              <button key={r} onClick={() => toggleRisk(r)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  active ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-300 text-slate-600 hover:border-slate-900"
                }`}>
                {active && "✓ "}{r}
              </button>
            );
          })}
        </div>
        {riskItems.filter(r => !commonRisks.includes(r.text)).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {riskItems.filter(r => !commonRisks.includes(r.text)).map(r => (
              <span key={r.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                {r.text}
                <button onClick={() => removeRisk(r.id)} className="text-slate-400 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input value={customRisk} onChange={e => setCustomRisk(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addRisk()}
            placeholder="Custom risk or dependency…"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={addRisk} disabled={!customRisk.trim()}
            className="px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 disabled:opacity-40">
            Add
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all">
          Define Success Criteria →
        </button>
      </div>
    </div>
  );
}
