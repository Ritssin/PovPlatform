import type { PoV } from "@prisma/client";

export function qualScore(pov: Pick<PoV,
  'scoreExecutive'|'scoreUseCase'|'scoreUrgency'|'scoreCompetition'|'scoreReadiness'|'scoreAlignment'
>): number {
  return (
    pov.scoreExecutive   * 4 +
    pov.scoreUseCase     * 4 +
    pov.scoreUrgency     * 3 +
    pov.scoreCompetition * 3 +
    pov.scoreReadiness   * 3 +
    pov.scoreAlignment   * 3
  );
}

export function recommendation(score: number): string {
  return score >= 70 ? "Ready to proceed" : "Under review";
}

export function computeDashboardFields(pov: PoV): {
  readinessScore: number;
  percentValidated: number;
  criteriaTotal: number;
  criteriaValidated: number;
} {
  const planCriteria = (pov.planCriteria as unknown as string[]) ?? [];
  const trackingData = (pov.trackingData as unknown as Record<string, { status?: string }>) ?? {};

  const criteriaTotal    = planCriteria.length;
  const criteriaValidated = planCriteria.filter(
    (id) => trackingData[id]?.status === "Validated"
  ).length;

  return {
    readinessScore:   qualScore(pov),
    percentValidated: criteriaTotal > 0 ? Math.round((criteriaValidated / criteriaTotal) * 100) : 0,
    criteriaTotal,
    criteriaValidated,
  };
}
