import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const PatchUserSchema = z.object({
  name:     z.string().min(1).optional(),
  role:     z.nativeEnum(Role).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = PatchUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name)     updateData.name     = parsed.data.name;
  if (parsed.data.role)     updateData.role     = parsed.data.role;
  if (parsed.data.password) updateData.password = await bcrypt.hash(parsed.data.password, 12);

  const user = await db.user.update({
    where:  { id: params.id },
    data:   updateData,
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await db.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
