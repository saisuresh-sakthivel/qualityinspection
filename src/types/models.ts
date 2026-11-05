/** Fixed defect taxonomy accepted by the vision pipeline and UI. */
export type DefectType =
  | "Scratch"
  | "Dent"
  | "Paint Issue"
  | "Missing Component"
  | "No Defect";

/** Application roles used for the lightweight role switcher. */
export type UserRole = "QUALITY_ENGINEER" | "PRODUCTION_SUPERVISOR";

/** Seeded inspector / supervisor identity. */
export interface User {
  id: string;
  name: string;
  role: UserRole;
}

/** Production batch available for inspection. */
export interface Batch {
  id: string;
  productName: string;
  productionLine: string;
}

/**
 * Persisted inspection record.
 * AI fields are immutable after create; human override only changes final fields.
 */
export interface Inspection {
  id: string;
  batchId: string;
  imagePath: string;
  aiPredictedDefectType: DefectType | null;
  aiConfidence: number | null;
  finalDefectType: DefectType;
  wasOverridden: boolean;
  comments: string | null;
  inspectorId: string;
  inspectedAt: Date;
}

/** Ephemeral vision prediction shown before the engineer confirms. */
export interface VisionPrediction {
  predictedDefectType: DefectType;
  confidence: number;
}

/** Aggregate KPIs for the dashboard. */
export interface InspectionKpis {
  total: number;
  passed: number;
  rejected: number;
  defectRate: number;
  aiAcceptanceRate: number;
  defectBreakdown: Record<DefectType, number>;
}
