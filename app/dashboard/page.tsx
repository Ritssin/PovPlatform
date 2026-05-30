import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import NewPoVButton from "@/components/dashboard/NewPoVButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isManager = session.user.role === "MANAGER" || session.user.role === "ADMIN";

  const povs = await db.poV.findMany({
    where: isManager ? {} : { ownerId: session.user.id },
    select: {
      id: true,
      customerName: true,
      customerIndustry: true,
      ownerType: true,
      selectedProducts: true,
      selectedOutcomes: true,
      povStartDate: true,
      povEndDate: true,
      readinessScore: true,
      percentValidated: true,
      criteriaTotal: true,
      criteriaValidated: true,
      status: true,
      updatedAt: true,
      owner: { select: { name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PoV Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isManager ? "All active evaluations" : "Your evaluations"}
          </p>
        </div>
        <NewPoVButton />
      </div>

      <DashboardShell
        initialPovs={povs as Parameters<typeof DashboardShell>[0]["initialPovs"]}
        isManager={isManager}
        role={session.user.role}
      />
    </div>
  );
}
