"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ActionItem { id: string; task: string; owner: string; dueDate: string; priority: string; status: string; }
interface UpdateLog  { id: string; date: string; title: string; text: string; }
interface TrackingEntry { status: string; findings?: string; owner?: string; }

interface FullPoV {
  id: string;
  customerName: string;
  customerIndustry: string;
  salesEngineer: string;
  partnerName: string;
  executiveSponsor: string;
  opportunityValue: string;
  selectedProducts: string[];
  driverItems: { id: string; text: string }[];
  riskItems: { id: string; text: string }[];
  planCriteria: string[];
  trackingData: Record<string, TrackingEntry>;
  actionItems: ActionItem[];
  updateLog: UpdateLog[];
  readinessScore: number;
  percentValidated: number;
  criteriaTotal: number;
  criteriaValidated: number;
  status: string;
  povStartDate: string | null;
  povEndDate: string | null;
  owner: { name?: string | null; email?: string | null };
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60",
  DRAFT:     "bg-card-alt text-fg-dim border border-border",
  AT_RISK:   "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60",
  COMPLETE:  "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60",
  CANCELLED: "bg-card-alt text-fg-muted border border-border",
};

export default function DetailDrawer({
  povId, onClose,
}: { povId: string | null; onClose: () => void }) {
  const [pov,     setPov]     = useState<FullPoV | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!povId) { setPov(null); return; }
    setLoading(true);
    fetch(`/api/pov/${povId}`)
      .then(r => r.json())
      .then(data => { setPov(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [povId]);

  if (!povId) return null;

  const now = new Date();

  const overdue = pov?.actionItems.filter(a =>
    a.status !== "Done" && a.dueDate && new Date(a.dueDate) < now
  ).length ?? 0;

  const doneTasks = pov?.actionItems.filter(a => a.status === "Done").length ?? 0;

  const recentNotes = [...(pov?.updateLog ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 3);

  const byProduct: Record<string, { total: number; validated: number }> = {};
  (pov?.planCriteria ?? []).forEach(id => {
    const product = id.split("-")[0];
    if (!byProduct[product]) byProduct[product] = { total: 0, validated: 0 };
    byProduct[product].total++;
    const entry = pov?.trackingData[id];
    if (entry?.status === "Validated") byProduct[product].validated++;
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 overflow-y-auto border-l border-border">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-start justify-between">
          <div>
            {pov ? (
              <>
                <h2 className="font-bold text-fg text-lg">{pov.customerName}</h2>
                <p className="text-sm text-fg-dim">{pov.customerIndustry}</p>
              </>
            ) : <div className="h-6 w-40 bg-card-alt rounded animate-pulse" />}
          </div>
          <button onClick={onClose} className="text-fg-muted hover:text-fg p-1 rounded-lg hover:bg-card-alt transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {loading && (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-card-alt rounded animate-pulse" style={{ width: `${60 + i * 5}%` }} />
            ))}
          </div>
        )}

        {pov && !loading && (
          <div className="p-5 space-y-5">
            {/* Status + score */}
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[pov.status] ?? "bg-card-alt text-fg-dim"}`}>
                {pov.status.replace("_", " ")}
              </span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                pov.readinessScore >= 70
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
              }`}>
                Score {pov.readinessScore}/90
              </span>
            </div>

            {/* Engagement summary */}
            <Section title="Engagement">
              <Row label="Owner" value={pov.owner.name ?? pov.owner.email ?? "—"} />
              {pov.salesEngineer && <Row label="SE" value={pov.salesEngineer} />}
              {pov.partnerName && <Row label="Partner" value={pov.partnerName} />}
              {pov.executiveSponsor && <Row label="Exec sponsor" value={pov.executiveSponsor} />}
              {pov.opportunityValue && <Row label="Opp. value" value={pov.opportunityValue} />}
              <Row label="Dates"
                value={[
                  pov.povStartDate ? new Date(pov.povStartDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null,
                  pov.povEndDate   ? new Date(pov.povEndDate).toLocaleDateString("en-GB",   { day: "numeric", month: "short" }) : null,
                ].filter(Boolean).join(" → ") || "—"}
              />
              {pov.selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {pov.selectedProducts.map(p => (
                    <span key={p} className="text-xs bg-card-alt border border-border px-2 py-0.5 rounded font-medium text-fg-dim">{p}</span>
                  ))}
                </div>
              )}
            </Section>

            {/* Criteria progress */}
            <Section title="Criteria progress">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-card-alt border border-border rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pov.percentValidated === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                    style={{ width: `${pov.percentValidated}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-fg">{pov.percentValidated}%</span>
              </div>
              <p className="text-xs text-fg-muted mb-3">{pov.criteriaValidated}/{pov.criteriaTotal} validated</p>
              {Object.entries(byProduct).map(([product, { total, validated }]) => (
                <div key={product} className="flex items-center gap-2 mb-1">
                  <span className="text-xs w-16 text-fg-dim font-medium">{product}</span>
                  <div className="flex-1 bg-card-alt border border-border rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-400"
                      style={{ width: `${total ? (validated / total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-fg-muted w-10 text-right">{validated}/{total}</span>
                </div>
              ))}
            </Section>

            {/* Business drivers */}
            {pov.driverItems.length > 0 && (
              <Section title="Business drivers">
                <div className="flex flex-wrap gap-1.5">
                  {pov.driverItems.map(d => (
                    <span key={d.id} className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800/50">
                      {d.text}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Action items */}
            <Section title="Action items">
              <div className="flex gap-4 text-sm">
                <span className="font-semibold text-fg">{doneTasks}/{pov.actionItems.length} done</span>
                {overdue > 0 && (
                  <span className="text-red-500 dark:text-red-400 font-semibold">{overdue} overdue</span>
                )}
              </div>
            </Section>

            {/* Recent notes */}
            {recentNotes.length > 0 && (
              <Section title="Recent notes">
                <div className="space-y-3">
                  {recentNotes.map(n => (
                    <div key={n.id}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-fg">{n.title}</span>
                        <span className="text-xs text-fg-muted">{new Date(n.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                      </div>
                      <p className="text-xs text-fg-dim line-clamp-2">{n.text}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Open button */}
            <Link
              href={`/pov/${pov.id}/execute`}
              className="block w-full text-center bg-accent hover:bg-accent-h text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Open PoV →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs mb-1">
      <span className="text-fg-dim w-24 shrink-0">{label}</span>
      <span className="text-fg">{value}</span>
    </div>
  );
}
