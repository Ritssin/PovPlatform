import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { qualScore } from "@/lib/scores";
import type { TrackingEntry, ActionItem, UpdateLogEntry, DriverItem, RiskItem } from "@/types/pov";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [pov, criteriaLib, outcomes] = await Promise.all([
    db.poV.findUnique({ where: { id: params.id } }),
    db.criterion.findMany({ where: { active: true } }),
    db.outcome.findMany({ where: { active: true } }),
  ]);
  if (!pov) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const score        = qualScore(pov);
  const trackingData = (pov.trackingData as unknown as Record<string, TrackingEntry>) ?? {};
  const planCriteria = (pov.planCriteria as unknown as string[]) ?? [];
  const criteria     = planCriteria.map(id => criteriaLib.find(c => c.id === id)).filter(Boolean) as typeof criteriaLib;
  const validated    = criteria.filter(c => trackingData[c.id]?.status === "Validated");
  const inProgress   = criteria.filter(c => trackingData[c.id]?.status === "In Progress");
  const blocked      = criteria.filter(c => trackingData[c.id]?.status === "Blocked");
  const failed       = criteria.filter(c => trackingData[c.id]?.status === "Failed");
  const pct          = criteria.length > 0 ? Math.round(validated.length / criteria.length * 100) : 0;
  const selOutcomes  = (pov.selectedOutcomes as unknown as string[]) ?? [];

  const data = {
    _format: "Sophos PoV Deck JSON v1.0",
    metadata: {
      customer:         pov.customerName,
      industry:         pov.customerIndustry,
      sophosContact:    pov.salesEngineer ?? "",
      partner:          pov.partnerName,
      executiveSponsor: pov.executiveSponsor,
      estimatedValue:   pov.opportunityValue,
      period:           { start: pov.povStartDate, end: pov.povEndDate },
      exportDate:       new Date().toISOString(),
      readinessScore:   score,
      recommendation:   score >= 70 ? "Ready to proceed" : "Under review",
    },
    summary: {
      businessDrivers:   (pov.driverItems as unknown as DriverItem[]).map(d => d.text),
      additionalContext: pov.businessDrivers,
      productsEvaluated: pov.selectedProducts,
      outcomesSelected:  selOutcomes.length,
      criteriaTotal:     criteria.length,
      criteriaValidated: validated.length,
      criteriaInProgress: inProgress.length,
      criteriaBlocked:   blocked.length,
      criteriaFailed:    failed.length,
      percentValidated:  pct,
      outcomeSummary:    pov.outcomeSummary,
      nextSteps:         pov.nextSteps,
    },
    objectives: selOutcomes.map(oid => {
      const o = outcomes.find(x => x.id === oid);
      if (!o) return null;
      const vc = o.criteriaIds.filter(cid => trackingData[cid]?.status === "Validated").length;
      const pc = o.criteriaIds.filter(cid => criteria.find(c => c.id === cid)).length;
      return { title: o.title, description: o.description, criteriaInPlan: pc, criteriaValidated: vc };
    }).filter(Boolean),
    criteria: criteria.map(c => ({
      id: c.id, product: c.product, requirement: c.requirement,
      successCriteria: c.successCriteria, measurement: c.measurement,
      status:   trackingData[c.id]?.status   ?? "Not Started",
      findings: trackingData[c.id]?.findings ?? "",
      owner:    trackingData[c.id]?.owner    ?? "",
    })),
    actions: (pov.actionItems as unknown as ActionItem[]).map(a => ({
      task: a.task, owner: a.owner, dueDate: a.dueDate, priority: a.priority, status: a.status,
    })),
    progressNotes: (pov.updateLog as unknown as UpdateLogEntry[]).map(e => ({
      date: e.date, title: e.title ?? "", text: e.text,
    })),
    assumptions: (pov.riskItems as unknown as RiskItem[]).map(r => r.text),
    milestones:  (pov.milestones as unknown as Array<{week:string;activity:string}>).map(m => ({
      phase: m.week, activity: m.activity,
    })),
    slides: [
      { slideNumber:1, type:"title", title:"Sophos Proof of Value", subtitle: pov.customerName },
      { slideNumber:2, type:"overview", title:"Evaluation Overview" },
      { slideNumber:3, type:"objectives", title:"Evaluation Objectives" },
      { slideNumber:4, type:"results", title:"Results: What Was Validated" },
      { slideNumber:5, type:"findings", title:"Key Findings & Business Value" },
      { slideNumber:6, type:"next_steps", title:"Next Steps" },
    ],
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${pov.customerName.replace(/\s+/g,"_")}_PoV_Deck.json"`,
    },
  });
}
