import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const PatchSchema = z.object({
  text:      z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  active:    z.boolean().optional(),
  meta:      z.record(z.unknown()).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { meta, ...rest } = parsed.data;
  const item = await db.libraryItem.update({
    where: { id: params.id },
    data: { ...rest, ...(meta !== undefined ? { meta: meta as never } : {}) },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const item = await db.libraryItem.update({ where: { id: params.id }, data: { active: false } });
  return NextResponse.json(item);
}
