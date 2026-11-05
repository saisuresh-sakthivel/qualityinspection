import { describe, expect, it } from "vitest";
import { computeInspectionKpis } from "@/domain/kpis";
import type { DefectType } from "@/types/models";

/**
 * Ten inspections: six pass, four are rejected (40% defect rate),
 * and eight keep the AI label (80% AI acceptance).
 */
function briefSample(): {
  finalDefectType: DefectType;
  wasOverridden: boolean;
}[] {
  return [
    ...Array.from({ length: 6 }, () => ({
      finalDefectType: "No Defect" as const,
      wasOverridden: false,
    })),
    { finalDefectType: "Dent", wasOverridden: false },
    { finalDefectType: "Dent", wasOverridden: false },
    { finalDefectType: "Scratch", wasOverridden: true },
    { finalDefectType: "Scratch", wasOverridden: true },
  ];
}

describe("computeInspectionKpis", () => {
  it("uses rejected/total and non-overridden/total", () => {
    const kpis = computeInspectionKpis(briefSample());

    expect(kpis.total).toBe(10);
    expect(kpis.passed).toBe(6);
    expect(kpis.rejected).toBe(4);
    expect(kpis.defectRate).toBeCloseTo(0.4);
    expect(kpis.aiAcceptanceRate).toBeCloseTo(0.8);
    expect(kpis.defectBreakdown).toMatchObject({
      Scratch: 2,
      Dent: 2,
      "Paint Issue": 0,
      "Missing Component": 0,
      "No Defect": 6,
    });
  });

  it("returns zero rates when nothing has been inspected", () => {
    const kpis = computeInspectionKpis([]);
    expect(kpis.defectRate).toBe(0);
    expect(kpis.aiAcceptanceRate).toBe(0);
  });
});
