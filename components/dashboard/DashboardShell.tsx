"use client";

import { useState, useEffect, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import PipelineTable from "./PipelineTable";
import DetailDrawer from "./DetailDrawer";
import CsvExport from "./CsvExport";
import SummaryCards from "./SummaryCards";

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
  criteriaTotal: number;
  criteriaValidated: number;
  status: string;
  updatedAt: Date;
  owner: { name?: string | null; email?: string | null };
}

interface Props {
  initialPovs: PoVRow[];
  isManager: boolean;
  role: string;
}

export default function DashboardShell({ initialPovs, isManager, role }: Props) {
  const [povs,          setPovs]          = useState(initialPovs);
  const [selectedPovId, setSelectedPovId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const res  = await fetch("/api/pov");
      const data = await res.json();
      if (Array.isArray(data)) setPovs(data);
    } catch { /* ignore */ }
  }, []);

  // Supabase Realtime subscription (lazy import avoids SSR bundle issues)
  useEffect(() => {
    let active = true;
    let removeChannel: (() => void) | null = null;

    import("@/lib/supabase-browser").then(({ supabase }) => {
      if (!active) return; // cleanup already ran — don't subscribe
      const channel = supabase
        .channel("pov-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "PoV" }, () => refetch())
        .subscribe();
      removeChannel = () => supabase.removeChannel(channel);
    });

    return () => {
      active = false;       // prevent subscribe if Promise resolves after cleanup
      removeChannel?.();    // unsubscribe if channel was already created
    };
  }, [refetch]);

  const canExport = role === "MANAGER" || role === "ADMIN";

  return (
    <>
      <SummaryCards povs={povs} />

      {canExport && (
        <div className="flex justify-end">
          <CsvExport povs={povs} />
        </div>
      )}

      <PipelineTable
        povs={povs}
        isManager={isManager}
        onRowClick={pov => setSelectedPovId(pov.id)}
        selectedId={selectedPovId}
      />

      <DetailDrawer
        povId={selectedPovId}
        onClose={() => setSelectedPovId(null)}
      />
    </>
  );
}
