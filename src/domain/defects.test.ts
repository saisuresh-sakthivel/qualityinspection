import { describe, expect, it } from "vitest";
import { isDefectType, normalizeDefectLabel, wasOverridden } from "@/domain/defects";

describe("defect taxonomy", () => {
  it("accepts only the five fixed labels", () => {
    expect(isDefectType("Scratch")).toBe(true);
    expect(isDefectType("Dent")).toBe(true);
    expect(isDefectType("Paint Issue")).toBe(true);
    expect(isDefectType("Missing Component")).toBe(true);
    expect(isDefectType("No Defect")).toBe(true);
    expect(isDefectType("Crack")).toBe(false);
  });

  it("maps synonyms onto the taxonomy and rejects unknown labels", () => {
    expect(normalizeDefectLabel("scratch")).toBe("Scratch");
    expect(normalizeDefectLabel("paint_issue")).toBe("Paint Issue");
    expect(normalizeDefectLabel("missing")).toBe("Missing Component");
    expect(normalizeDefectLabel("passed")).toBe("No Defect");
    expect(normalizeDefectLabel("rust")).toBeNull();
  });
});

describe("wasOverridden", () => {
  it("is false when the engineer keeps the AI label", () => {
    expect(wasOverridden("Dent", "Dent")).toBe(false);
  });

  it("is true when the final label differs, including a missing prediction", () => {
    expect(wasOverridden("Dent", "Scratch")).toBe(true);
    expect(wasOverridden(null, "No Defect")).toBe(true);
  });
});
