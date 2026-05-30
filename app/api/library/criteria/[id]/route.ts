import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const PatchSchema = z.object({
  product:         z.string().min(1).optional(),
  requirement:     z.string().min(1).optional(),
  businessProblem: z.string().optional(),
  successCriteria: z.string().optional(),
  measurement:     z.string().optional(),
  competitiveEdge: z.string().optional(),
  edgeTags:        z.array(z.string()).optional(),
  sortOrder:       z.number().int().optional(),
  active:          z.boolean().optional(),
});

// PATCH /api/library/criteria/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const criterion = await db.criterion.update({
    where: { id: params.id },
    data:  parsed.data,
  });
  return NextResponse.json(criterion);
}

// DELETE /api/library/criteria/[id] — soft delete
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const criterion = await db.criterion.update({
    where: { id: params.id },
    data:  { active: false },
  });
  return NextResponse.json(criterion);
}
