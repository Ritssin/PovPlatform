import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const PatchSchema = z.object({
  icon:        z.string().optional(),
  color:       z.string().optional(),
  title:       z.string().min(1).optional(),
  description: z.string().optional(),
  criteriaIds: z.array(z.string()).optional(),
  sortOrder:   z.number().int().optional(),
  active:      z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const outcome = await db.outcome.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(outcome);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const outcome = await db.outcome.update({ where: { id: params.id }, data: { active: false } });
  return NextResponse.json(outcome);
}
