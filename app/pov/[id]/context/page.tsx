import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import BusinessContextForm from "@/components/pov/BusinessContext";

export default async function ContextPage({ params }: { params: { id: string } }) {
  const [pov, library] = await Promise.all([
    db.poV.findUnique({ where: { id: params.id } }),
    db.libraryItem.findMany({
      where: { active: true, type: { in: ["DRIVER", "RISK", "INDUSTRY", "PRODUCT"] } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!pov) notFound();

  const drivers   = library.filter((i) => i.type === "DRIVER").map((i) => i.text);
  const risks     = library.filter((i) => i.type === "RISK").map((i) => i.text);
  const industries = library.filter((i) => i.type === "INDUSTRY").map((i) => i.text);
  const products  = library.filter((i) => i.type === "PRODUCT").map((i) => i.text);

  return (
    <BusinessContextForm
      pov={pov}
      commonDrivers={drivers}
      commonRisks={risks}
      industries={industries}
      products={products}
    />
  );
}
