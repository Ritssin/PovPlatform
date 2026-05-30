import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from "./db";
import type { Session } from "next-auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function writeAuditLog({
  userId,
  action,
  resourceId,
  before,
  after,
  ip,
}: {
  userId: string;
  action: string;
  resourceId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        resourceId,
        before: before ? JSON.parse(JSON.stringify(before)) : undefined,
        after: after ? JSON.parse(JSON.stringify(after)) : undefined,
        ip,
      },
    });
  } catch {
    // Audit failures must never crash the application
    console.error("Audit log write failed:", action, resourceId);
  }
}

export function getDaysRemaining(endDate: Date | string | null | undefined): number | null {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function getPoVStatus(
  percentValidated: number,
  endDate: Date | string | null | undefined
): "DRAFT" | "ACTIVE" | "AT_RISK" | "COMPLETE" {
  if (percentValidated === 100) return "COMPLETE";
  const days = getDaysRemaining(endDate);
  if (days !== null && days <= 5 && percentValidated < 100) return "AT_RISK";
  if (percentValidated > 0) return "ACTIVE";
  return "DRAFT";
}

export function requireRole(session: Session | null, ...roles: string[]): boolean {
  return !!session?.user?.role && roles.includes(session.user.role);
}
