import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { qualScore } from "@/lib/scores";
import type { TrackingEntry, DriverItem, RiskItem } from "@/types/pov";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [pov, criteriaLib] = await Promise.all([
    db.poV.findUnique({ where: { id: params.id } }),
    db.criterion.findMany({ where: { active: true } }),
  ]);
  if (!pov) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const score         = qualScore(pov);
  const trackingData  = (pov.trackingData as unknown as Record<string, TrackingEntry>) ?? {};
  const driverItems   = (pov.driverItems as unknown as DriverItem[]) ?? [];
  const riskItems     = (pov.riskItems as unknown as RiskItem[])   ?? [];
  const planCriteria  = (pov.planCriteria as unknown as string[])     ?? [];
  const criteria      = planCriteria.map(id => criteriaLib.find(c => c.id === id)).filter(Boolean) as typeof criteriaLib;
  const validated     = criteria.filter(c => trackingData[c.id]?.status === "Validated");
  const active        = criteria.filter(c => { const s = trackingData[c.id]?.status; return s && s !== "Not Started"; });
  const milestones    = pov.milestones as Array<{week:string;activity:string}>;
  const openActions   = (pov.actionItems as unknown as Array<{task:string;owner:string;dueDate:string;priority:string;status:string}>)
                        .filter(a => a.status !== "Done");
  const progressNotes = [...((pov.updateLog as unknown as Array<{date:string;title:string;text:string}>) ?? [])]
                        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pct           = criteria.length > 0 ? Math.round(validated.length / criteria.length * 100) : 0;
  const esc           = (s: string) => (s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\n/g,"<br>");

  const glanceRows = [
    ["PoV Period", `${pov.povStartDate ? new Date(pov.povStartDate).toLocaleDateString("en-GB") : "—"} to ${pov.povEndDate ? new Date(pov.povEndDate).toLocaleDateString("en-GB") : "—"}`],
    ["Products Evaluated", (pov.selectedProducts as unknown as string[]).join(", ") || "—"],
    ["Outcomes Selected",  `${(pov.selectedOutcomes as unknown as string[]).length}`],
    ["Criteria Validated", `${validated.length} of ${criteria.length} (${pct}%)`],
    ["Readiness Score",    `${score} / 90 — ${score >= 70 ? "Ready to proceed" : "Under review"}`],
  ].map(([k,v]) => `<tr><td style="font-weight:600;color:#475569;width:160pt;padding:4pt 8pt;border:1px solid #e2e8f0">${k}</td><td style="padding:4pt 8pt;border:1px solid #e2e8f0">${v}</td></tr>`).join("");

  const criteriaRows = active.map(c => {
    const t = trackingData[c.id] ?? {};
    const statusColor = t.status === "Validated" ? "#059669" : t.status === "Blocked" ? "#d97706" : "#64748b";
    return `<tr><td style="padding:4pt 6pt;border:1px solid #e2e8f0"><strong>${esc(c.requirement)}</strong><br><small style="color:#94a3b8">${esc(c.product)}</small></td><td style="padding:4pt 6pt;border:1px solid #e2e8f0">${esc(c.successCriteria)}</td><td style="padding:4pt 6pt;border:1px solid #e2e8f0">${esc(t.findings ?? "")}</td><td style="padding:4pt 6pt;border:1px solid #e2e8f0;color:${statusColor};font-weight:600">${esc(t.status ?? "Not Started")}</td></tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Sophos PoV Executive Summary</title>
<style>
body{font-family:Calibri,Arial,sans-serif;margin:2cm;color:#1e293b;font-size:11pt}
h1{font-size:20pt;color:#0B1F3A;border-bottom:2px solid #0049BD;padding-bottom:6pt;margin-bottom:4pt}
h2{font-size:13pt;color:#0B1F3A;border-bottom:1px solid #e2e8f0;padding-bottom:3pt;margin-top:16pt}
table{border-collapse:collapse;width:100%;margin:8pt 0;font-size:9pt}
th{background:#0B1F3A;color:white;padding:5pt 6pt;text-align:left;font-size:9pt}
p{margin:4pt 0;line-height:1.5}
.foot{color:#94a3b8;font-size:8pt;border-top:1px solid #e2e8f0;margin-top:20pt;padding-top:4pt}
</style></head><body>
<h1>Sophos Proof of Value — Executive Summary</h1>
<p style='font-size:10pt;color:#64748b'>${esc(pov.customerName)}${pov.customerIndustry ? " · " + esc(pov.customerIndustry) : ""} &nbsp;|&nbsp; Sophos Contact: ${esc(pov.salesEngineer ?? "")} &nbsp;|&nbsp; ${new Date().toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"})}</p>
<h2>Evaluation at a Glance</h2><table>${glanceRows}</table>
${driverItems.length ? `<h2>Business Context &amp; Goals</h2><ul style='margin:4pt 0;padding-left:18pt'>${driverItems.map(d => `<li style='margin-bottom:3pt'>${esc(d.text)}</li>`).join("")}</ul>${pov.businessDrivers ? `<p>${esc(pov.businessDrivers)}</p>` : ""}` : ""}
${active.length ? `<h2>Criteria Results</h2><table><thead><tr><th>Requirement</th><th>Success Criteria</th><th>Evidence</th><th>Status</th></tr></thead><tbody>${criteriaRows}</tbody></table>` : ""}
${pov.outcomeSummary ? `<h2>Key Findings</h2><p>${esc(pov.outcomeSummary)}</p>` : ""}
${riskItems.length ? `<h2>Assumptions &amp; Mitigations</h2><p>• ${riskItems.map(r => esc(r.text)).join("<br>• ")}</p>` : ""}
${pov.nextSteps ? `<h2>Next Steps</h2><p>${esc(pov.nextSteps)}</p>` : ""}
${openActions.length ? `<h2>Agreed Actions</h2><table><thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Priority</th></tr></thead><tbody>${openActions.map(a => `<tr><td style="padding:3pt 5pt;border:1px solid #e2e8f0;font-size:9pt">${esc(a.task)}</td><td style="padding:3pt 5pt;border:1px solid #e2e8f0;font-size:9pt">${esc(a.owner)}</td><td style="padding:3pt 5pt;border:1px solid #e2e8f0;font-size:9pt">${esc(a.dueDate)}</td><td style="padding:3pt 5pt;border:1px solid #e2e8f0;font-size:9pt">${esc(a.priority)}</td></tr>`).join("")}</tbody></table>` : ""}
${milestones.length ? `<h2>Milestones</h2><table><thead><tr><th>Phase</th><th>Activity</th></tr></thead><tbody>${milestones.map(m => `<tr><td style="padding:4pt 6pt;border:1px solid #e2e8f0;font-weight:600">${esc(m.week)}</td><td style="padding:4pt 6pt;border:1px solid #e2e8f0">${esc(m.activity)}</td></tr>`).join("")}</tbody></table>` : ""}
${progressNotes.length ? `<h2>Progress Notes</h2><table><thead><tr><th style="width:80pt">Date</th><th style="width:120pt">Title</th><th>Note</th></tr></thead><tbody>${progressNotes.map(n => `<tr><td style="padding:3pt 5pt;border:1px solid #e2e8f0;font-size:9pt;white-space:nowrap">${new Date(n.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</td><td style="padding:3pt 5pt;border:1px solid #e2e8f0;font-size:9pt;font-weight:600">${esc(n.title)}</td><td style="padding:3pt 5pt;border:1px solid #e2e8f0;font-size:9pt">${esc(n.text)}</td></tr>`).join("")}</tbody></table>` : ""}
<p class='foot'>Generated ${new Date().toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"})} | Sophos Proof of Value Platform</p>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "application/msword",
      "Content-Disposition": `attachment; filename="${pov.customerName.replace(/\s+/g,"_")}_PoV.doc"`,
    },
  });
}
