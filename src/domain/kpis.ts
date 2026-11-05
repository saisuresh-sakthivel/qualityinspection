import type { DefectType, Inspection, InspectionKpis } from "@/types/models";
import { DEFECT_TYPES } from "@/domain/defects";

/**
 * Builds an empty per-defect counter map for KPI aggregation.
 */
function emptyBreakdown(): Record<DefectType, number> {
  return DEFECT_TYPES.reduce(
    (acc, type) => {
      acc[type] = 0;
      return acc;
    },
    {} as Record<DefectType, number>,
  );
}

/**
 * Computes dashboard KPIs from a list of inspections.
 * Defect rate = rejected / total. AI acceptance = non-overridden / total.
 */
export function computeInspectionKpis(
  inspections: Pick<Inspection, "finalDefectType" | "wasOverridden">[],
): InspectionKpis {
  const total = inspections.length;
  const breakdown = emptyBreakdown();
  let passed = 0;
  let acceptedByHuman = 0;

  for (const inspection of inspections) {
    breakdown[inspection.finalDefectType] += 1;
    if (inspection.finalDefectType === "No Defect") {
      passed += 1;
    }
    if (!inspection.wasOverridden) {
      acceptedByHuman += 1;
    }
  }

  const rejected = total - passed;

  return {
    total,
    passed,
    rejected,
    defectRate: total === 0 ? 0 : rejected / total,
    aiAcceptanceRate: total === 0 ? 0 : acceptedByHuman / total,
    defectBreakdown: breakdown,
  };
}
