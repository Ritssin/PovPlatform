import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LibraryType } from "@prisma/client";
import { requireAdmin } from "@/lib/api-auth";

const ItemSchema = z.object({
  type:      z.nativeEnum(LibraryType),
  text:      z.string().min(1),
  sortOrder: z.number().int().default(0),
  meta:      z.record(z.unknown()).optional(),
});

export const dynamic = "force-dynamic";

// GET /api/library/items?type=DRIVER
export async function GET(req: NextRequest) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const type = req.nextUrl.searchParams.get("type") as LibraryType | null;
  const items = await db.libraryItem.findMany({
    where: type ? { type } : {},
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(items);
}

// POST /api/library/items
export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const body = await req.json();
  const parsed = ItemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { meta, ...rest } = parsed.data;
  const item = await db.libraryItem.create({
    data: { ...rest, ...(meta !== undefined ? { meta: meta as never } : {}) },
  });
  return NextResponse.json(item, { status: 201 });
}
