"use client";

interface PoVRow {
  id: string;
  customerName: string;
  customerIndustry: string;
  ownerType: string;
  selectedProducts: unknown;
  povStartDate: Date | null;
  povEndDate: Date | null;
  readinessScore: number;
  percentValidated: number;
  criteriaValidated: number;
  criteriaTotal: number;
  status: string;
  owner: { name?: string | null; email?: string | null };
}

export default function CsvExport({ povs }: { povs: PoVRow[] }) {
  function download() {
    const now = new Date();

    const headers = ["Customer", "Industry", "Products", "Owner", "Type", "Start", "End", "Days Left", "Progress %", "Validated", "Total Criteria", "Score /90", "Status"];

    const rows = povs.map(p => {
      const products = (p.selectedProducts as string[] | null) ?? [];
      const daysLeft = p.povEndDate
        ? Math.max(0, Math.ceil((new Date(p.povEndDate).getTime() - now.getTime()) / 86_400_000))
        : "";
      return [
        p.customerName,
        p.customerIndustry,
        products.join("; "),
        p.owner.name ?? p.owner.email ?? "",
        p.ownerType,
        p.povStartDate ? new Date(p.povStartDate).toLocaleDateString("en-GB") : "",
        p.povEndDate   ? new Date(p.povEndDate).toLocaleDateString("en-GB")   : "",
        String(daysLeft),
        String(p.percentValidated),
        String(p.criteriaValidated),
        String(p.criteriaTotal),
        String(p.readinessScore),
        p.status,
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `pov-pipeline-${now.toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Export CSV
    </button>
  );
}
