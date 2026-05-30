import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import SuccessCriteriaForm from "@/components/pov/SuccessCriteria";

export default async function CriteriaPage({ params }: { params: { id: string } }) {
  const [pov, criteria, outcomes, pillars] = await Promise.all([
    db.poV.findUnique({ where: { id: params.id } }),
    db.criterion.findMany({ where: { active: true }, orderBy: [{ product: "asc" }, { sortOrder: "asc" }] }),
    db.outcome.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.pillar.findMany({ where: { active: true } }),
  ]);

  if (!pov) notFound();

  return (
    <SuccessCriteriaForm
      pov={pov}
      criteriaLibrary={criteria}
      outcomeLibrary={outcomes}
      pillars={pillars}
    />
  );
}
