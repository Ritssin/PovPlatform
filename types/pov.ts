// Shared TypeScript types used across client and server

export interface TrackingEntry {
  status: "Not Started" | "In Progress" | "Validated" | "Blocked" | "Failed";
  findings: string;
  owner: string;
}

export interface ActionItem {
  id: number;
  task: string;
  owner: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Done" | "Blocked";
}

export interface UpdateLogEntry {
  id: number;
  date: string; // ISO
  title: string;
  text: string;
}

export interface Milestone {
  id: number;
  week: string;
  activity: string;
}

export interface DriverItem {
  id: number;
  text: string;
}

export interface RiskItem {
  id: number;
  text: string;
}

export interface CustomCriterion {
  id: string;
  product: string;
  requirement: string;
  businessProblem: string;
  successCriteria: string;
  measurement: string;
  competitiveEdge: string;
  edgeTags: string[];
  isCustom: true;
}

export interface CriterionEdit {
  requirement?: string;
  businessProblem?: string;
  successCriteria?: string;
  measurement?: string;
  competitiveEdge?: string;
}

// The full PoV state as used on the client
export interface PoVFormState {
  id: string;
  ownerType: string;
  customerName: string;
  customerIndustry: string;
  partnerName: string;
  executiveSponsor: string;
  opportunityValue: string;
  scoreExecutive: number;
  scoreUseCase: number;
  scoreUrgency: number;
  scoreCompetition: number;
  scoreReadiness: number;
  scoreAlignment: number;
  selectedProducts: string[];
  driverItems: DriverItem[];
  businessDrivers: string;
  riskItems: RiskItem[];
  selectedOutcomes: string[];
  planCriteria: string[];
  criteriaEdits: Record<string, CriterionEdit>;
  customCriteria: CustomCriterion[];
  milestones: Milestone[];
  povStartDate: string;
  povEndDate: string;
  trackingData: Record<string, TrackingEntry>;
  actionItems: ActionItem[];
  updateLog: UpdateLogEntry[];
  outcomeSummary: string;
  nextSteps: string;
  status: string;
  readinessScore: number;
  percentValidated: number;
  criteriaTotal: number;
  criteriaValidated: number;
  updatedAt: string;
}
