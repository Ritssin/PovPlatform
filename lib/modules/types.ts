import type { ComponentType } from "react";
import type { PoV } from "@prisma/client";
import type { ZodSchema } from "zod";

export type ModuleCategory = "INTEGRATION" | "EVIDENCE" | "EXPORT" | "ANALYTICS";

export type CriterionStatus =
  | "Not Started"
  | "In Progress"
  | "Validated"
  | "Blocked"
  | "Failed";

export interface CriterionPanelProps {
  pov: PoV;
  criterionId: string;
}

export interface ExecuteSectionProps {
  pov: PoV;
}

export interface DashboardWidgetProps {
  records: PoVSummary[];
}

export interface PoVSummary {
  id: string;
  customerName: string;
  customerIndustry: string;
  sophosContact: string;
  ownerType: string;
  selectedProducts: string[];
  outcomesSelected: number;
  povStartDate: Date | null;
  povEndDate: Date | null;
  readinessScore: number;
  percentValidated: number;
  criteriaTotal: number;
  criteriaValidated: number;
  status: string;
  updatedAt: Date;
}

export interface PoVModule {
  /** Unique slug — used as the module ID in the registry */
  id: string;
  name: string;
  category: ModuleCategory;
  version: string;
  description?: string;

  // ── Lifecycle hooks ────────────────────────────────────────────────────────
  onPoVCreate?: (pov: PoV) => Promise<void>;
  onPoVUpdate?: (pov: PoV, changed: Partial<PoV>) => Promise<void>;
  onPoVComplete?: (pov: PoV) => Promise<void>;
  onCriterionStatus?: (
    pov: PoV,
    criterionId: string,
    status: CriterionStatus
  ) => Promise<void>;

  // ── UI extension slots (client components) ─────────────────────────────────
  /** Rendered inside each criterion card in Execute step */
  CriterionPanel?: ComponentType<CriterionPanelProps>;
  /** Rendered as a full section in Execute step (below the criteria table) */
  ExecuteSection?: ComponentType<ExecuteSectionProps>;
  /** Rendered as a widget card on the dashboard */
  DashboardWidget?: ComponentType<DashboardWidgetProps>;

  // ── Configuration ──────────────────────────────────────────────────────────
  configSchema?: ZodSchema;
  AdminSetup?: ComponentType;
  isConfigured?: (config: unknown) => boolean;
}
