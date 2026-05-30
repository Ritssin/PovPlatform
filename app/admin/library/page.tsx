import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import LibraryClient from "./LibraryClient";

export const dynamic = "force-dynamic";

export default async function AdminLibraryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const [criteria, outcomes, pillars, allItems] = await Promise.all([
    db.criterion.findMany({ orderBy: [{ product: "asc" }, { sortOrder: "asc" }] }),
    db.outcome.findMany({ orderBy: { sortOrder: "asc" } }),
    db.pillar.findMany(),
    db.libraryItem.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }] }),
  ]);

  const byType = (t: string) => allItems.filter(i => i.type === t);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Library Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage criteria, outcomes, pillars and list items. Changes apply to all new PoVs immediately.
          </p>
        </div>
        <a
          href="/api/library/export/html"
          className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Export Partner HTML
        </a>
      </div>

      <LibraryClient
        initialCriteria={criteria}
        initialOutcomes={outcomes}
        initialPillars={pillars}
        initialDrivers={byType("DRIVER")}
        initialRisks={byType("RISK")}
        initialActions={byType("ACTION")}
        initialProducts={byType("PRODUCT")}
        initialIndustries={byType("INDUSTRY")}
      />
    </div>
  );
}
