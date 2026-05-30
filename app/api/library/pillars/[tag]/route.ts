import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const PatchSchema = z.object({
  name:          z.string().min(1).optional(),
  what:          z.string().optional(),
  vsCompetitors: z.string().optional(),
  active:        z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { tag: string } }) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const pillar = await db.pillar.update({ where: { tag: params.tag }, data: parsed.data });
  return NextResponse.json(pillar);
}

export async function DELETE(_req: NextRequest, { params }: { params: { tag: string } }) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const pillar = await db.pillar.update({ where: { tag: params.tag }, data: { active: false } });
  return NextResponse.json(pillar);
}
