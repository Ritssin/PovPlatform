import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeDashboardFields, qualScore } from "@/lib/scores";
import { writeAuditLog, getPoVStatus } from "@/lib/utils";
import { registry } from "@/lib/modules/registry";
import type { PoV } from "@prisma/client";

const CreatePoVSchema = z.object({
  customerName:   z.string().min(1, "Customer name is required"),
  ownerType:      z.enum(["SE", "SME"]).default("SE"),
  salesEngineer:  z.string().optional(),
});

// GET /api/pov — list PoVs for the current user (or all for managers)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const isManager = session.user.role === "MANAGER" || session.user.role === "ADMIN";
  const ownerId = isManager ? searchParams.get("ownerId") ?? undefined : session.user.id;

  const povs = await db.poV.findMany({
    where: ownerId ? { ownerId } : {},
    select: {
      id: true, customerName: true, customerIndustry: true,
      ownerType: true, selectedProducts: true, selectedOutcomes: true,
      povStartDate: true, povEndDate: true,
      readinessScore: true, percentValidated: true,
      criteriaTotal: true, criteriaValidated: true,
      status: true, updatedAt: true,
      owner: { select: { name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(povs);
}

// POST /api/pov — create a new PoV
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreatePoVSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const defaultActions = await db.libraryItem.findMany({
    where: { type: "ACTION", active: true },
    orderBy: { sortOrder: "asc" },
  });

  const pov = await db.poV.create({
    data: {
      ownerId: session.user.id,
      ownerType: parsed.data.ownerType,
      customerName: parsed.data.customerName,
      salesEngineer: parsed.data.salesEngineer ?? "",
      actionItems: defaultActions.map((a, i) => ({
        id: i + 1,
        task: a.text,
        owner: "",
        dueDate: "",
        priority: (a.meta as { priority?: string })?.priority ?? "Medium",
        status: "Not Started",
      })),
      milestones: [
        { id: 1, week: "Week 1", activity: "Deployment and onboarding" },
        { id: 2, week: "Week 2", activity: "Use case validation" },
        { id: 3, week: "Week 3", activity: "Executive review and outcome" },
      ],
    },
  });

  await registry.dispatchPoVCreate(pov);
  await writeAuditLog({
    userId: session.user.id,
    action: "pov.create",
    resourceId: pov.id,
    after: { customerName: pov.customerName },
    ip: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(pov, { status: 201 });
}
