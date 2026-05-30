import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Session } from "next-auth";

function requireAdmin(session: Session | null) {
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

const CreateUserSchema = z.object({
  email:    z.string().email(),
  name:     z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role:     z.nativeEnum(Role).default(Role.SE),
});

export async function GET() {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const body = await req.json();
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  const user = await db.user.create({
    data: {
      email:    parsed.data.email,
      name:     parsed.data.name,
      password: hashed,
      role:     parsed.data.role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}
