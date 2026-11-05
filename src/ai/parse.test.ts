import { describe, expect, it } from "vitest";
import { parseVisionPrediction } from "@/ai/parse";

describe("parseVisionPrediction", () => {
  it("keeps a taxonomy label and a 0–1 confidence", () => {
    const prediction = parseVisionPrediction(
      JSON.stringify({
        predicted_defect_type: "Dent",
        confidence: 0.81,
      }),
    );
    expect(prediction).toEqual({
      predictedDefectType: "Dent",
      confidence: 0.81,
    });
  });

  it("accepts fenced JSON, synonyms, and percent-style confidence", () => {
    const prediction = parseVisionPrediction(
      '```json\n{"predicted_defect_type":"paint issue","confidence":81}\n```',
    );
    expect(prediction).toEqual({
      predictedDefectType: "Paint Issue",
      confidence: 0.81,
    });
  });

  it("returns null when the label or the payload cannot be trusted", () => {
    expect(
      parseVisionPrediction(
        JSON.stringify({
          predicted_defect_type: "Rust",
          confidence: 0.9,
        }),
      ),
    ).toBeNull();
    expect(parseVisionPrediction("not json")).toBeNull();
    expect(
      parseVisionPrediction(
        JSON.stringify({
          predicted_defect_type: "Dent",
          confidence: 150,
        }),
      ),
    ).toBeNull();
  });
});
