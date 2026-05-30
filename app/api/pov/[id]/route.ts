import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeDashboardFields, qualScore } from "@/lib/scores";
import { writeAuditLog, getPoVStatus } from "@/lib/utils";
import { registry } from "@/lib/modules/registry";
import { PoVStatus } from "@prisma/client";

// GET /api/pov/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pov = await db.poV.findUnique({ where: { id: params.id }, include: { owner: { select: { name: true, email: true } } } });
  if (!pov) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canAccess =
    pov.ownerId === session.user.id ||
    session.user.role === "MANAGER" ||
    session.user.role === "ADMIN";
  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(pov);
}

// PATCH /api/pov/[id] — auto-save (called on every field change)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.poV.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canEdit = existing.ownerId === session.user.id || session.user.role === "ADMIN";
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Accept any partial update — Zod passthrough allows unknown keys
  const body = await req.json();

  // Recompute denormalised dashboard fields from the merged PoV
  const merged = { ...existing, ...body };
  const { readinessScore, percentValidated, criteriaTotal, criteriaValidated } =
    computeDashboardFields(merged);

  const statusStr = getPoVStatus(percentValidated, merged.povEndDate);
  const statusEnum = PoVStatus[statusStr as keyof typeof PoVStatus] ?? PoVStatus.DRAFT;

  const updated = await db.poV.update({
    where: { id: params.id },
    data: {
      ...body,
      readinessScore,
      percentValidated,
      criteriaTotal,
      criteriaValidated,
      status: statusEnum,
    },
  });

  // Fire hooks (non-blocking)
  registry.dispatchPoVUpdate(updated, body).catch(() => {});

  // If status just became COMPLETE, fire onPoVComplete
  if (statusEnum === PoVStatus.COMPLETE && existing.status !== PoVStatus.COMPLETE) {
    registry.dispatchPoVComplete(updated).catch(() => {});
  }

  // If a criterion status changed, fire the hook
  const changedTracking = body.trackingData as Record<string, { status?: string }> | undefined;
  if (changedTracking) {
    const existingTracking = (existing.trackingData as unknown as Record<string, { status?: string }>) ?? {};
    for (const [criterionId, entry] of Object.entries(changedTracking)) {
      if (entry.status && entry.status !== existingTracking[criterionId]?.status) {
        registry
          .dispatchCriterionStatus(updated, criterionId, entry.status as never)
          .catch(() => {});
      }
    }
  }

  return NextResponse.json({ ok: true, status: statusEnum });
}

// DELETE /api/pov/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.poV.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canDelete = existing.ownerId === session.user.id || session.user.role === "ADMIN";
  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.poV.delete({ where: { id: params.id } });
  await writeAuditLog({
    userId: session.user.id,
    action: "pov.delete",
    resourceId: params.id,
    before: { customerName: existing.customerName },
  });

  return NextResponse.json({ ok: true });
}
