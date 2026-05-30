import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const CriterionSchema = z.object({
  id:              z.string().min(1),
  product:         z.string().min(1),
  requirement:     z.string().min(1),
  businessProblem: z.string().min(1),
  successCriteria: z.string().min(1),
  measurement:     z.string().min(1),
  competitiveEdge: z.string().min(1),
  edgeTags:        z.array(z.string()).default([]),
  sortOrder:       z.number().int().default(0),
});

export const dynamic = "force-dynamic";

// GET /api/library/criteria — admin: all criteria (incl. inactive)
export async function GET(req: NextRequest) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const onlyActive = req.nextUrl.searchParams.get("active") === "true";
  const criteria = await db.criterion.findMany({
    where: onlyActive ? { active: true } : {},
    orderBy: [{ product: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(criteria);
}

// POST /api/library/criteria — create new criterion
export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const body = await req.json();
  const parsed = CriterionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await db.criterion.findUnique({ where: { id: parsed.data.id } });
  if (existing) return NextResponse.json({ error: "Criterion ID already exists" }, { status: 409 });

  const criterion = await db.criterion.create({ data: parsed.data });
  return NextResponse.json(criterion, { status: 201 });
}
