import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/library — full library bundle (cached at edge for 60s)
export async function GET() {
  const [criteria, outcomes, pillars, drivers, risks, actions, products, industries] =
    await Promise.all([
      db.criterion.findMany({ where: { active: true }, orderBy: [{ product: "asc" }, { sortOrder: "asc" }] }),
      db.outcome.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      db.pillar.findMany({ where: { active: true } }),
      db.libraryItem.findMany({ where: { type: "DRIVER", active: true }, orderBy: { sortOrder: "asc" } }),
      db.libraryItem.findMany({ where: { type: "RISK", active: true }, orderBy: { sortOrder: "asc" } }),
      db.libraryItem.findMany({ where: { type: "ACTION", active: true }, orderBy: { sortOrder: "asc" } }),
      db.libraryItem.findMany({ where: { type: "PRODUCT", active: true }, orderBy: { sortOrder: "asc" } }),
      db.libraryItem.findMany({ where: { type: "INDUSTRY", active: true }, orderBy: { sortOrder: "asc" } }),
    ]);

  return NextResponse.json(
    { criteria, outcomes, pillars, drivers, risks, actions, products, industries },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
