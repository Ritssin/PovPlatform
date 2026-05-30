import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const OutcomeSchema = z.object({
  id:          z.string().min(1),
  icon:        z.string().min(1),
  color:       z.string().min(1),
  title:       z.string().min(1),
  description: z.string().min(1),
  criteriaIds: z.array(z.string()).default([]),
  sortOrder:   z.number().int().default(0),
});

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const outcomes = await db.outcome.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(outcomes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const body = await req.json();
  const parsed = OutcomeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await db.outcome.findUnique({ where: { id: parsed.data.id } });
  if (existing) return NextResponse.json({ error: "Outcome ID already exists" }, { status: 409 });

  const outcome = await db.outcome.create({ data: parsed.data });
  return NextResponse.json(outcome, { status: 201 });
}
