import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const PillarSchema = z.object({
  tag:           z.string().min(1),
  name:          z.string().min(1),
  what:          z.string().min(1),
  vsCompetitors: z.string().min(1),
});

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const pillars = await db.pillar.findMany();
  return NextResponse.json(pillars);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const body = await req.json();
  const parsed = PillarSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await db.pillar.findUnique({ where: { tag: parsed.data.tag } });
  if (existing) return NextResponse.json({ error: "Pillar tag already exists" }, { status: 409 });

  const pillar = await db.pillar.create({ data: parsed.data });
  return NextResponse.json(pillar, { status: 201 });
}
