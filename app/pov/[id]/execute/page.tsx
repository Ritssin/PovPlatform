import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ExecuteForm from "@/components/pov/Execute";

export default async function ExecutePage({ params }: { params: { id: string } }) {
  const [pov, criteria, outcomes] = await Promise.all([
    db.poV.findUnique({ where: { id: params.id } }),
    db.criterion.findMany({ where: { active: true }, orderBy: [{ product: "asc" }, { sortOrder: "asc" }] }),
    db.outcome.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!pov) notFound();

  return <ExecuteForm pov={pov} criteriaLibrary={criteria} outcomeLibrary={outcomes} />;
}
