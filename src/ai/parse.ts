import { z } from "zod";
import { normalizeDefectLabel } from "@/domain/defects";
import type { VisionPrediction } from "@/types/models";

const visionPayloadSchema = z.object({
  predicted_defect_type: z.string(),
  confidence: z.coerce.number(),
});

/**
 * Pulls a JSON object out of a model reply, including fenced blocks.
 */
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse(fenced?.[1] ?? trimmed);
}

/**
 * Constrains a vision model reply to the defect taxonomy.
 * Returns null when the payload cannot be trusted.
 */
export function parseVisionPrediction(text: string): VisionPrediction | null {
  try {
    const parsed = visionPayloadSchema.safeParse(extractJson(text));
    if (!parsed.success) {
      return null;
    }

    const predictedDefectType = normalizeDefectLabel(parsed.data.predicted_defect_type);
    if (!predictedDefectType) {
      return null;
    }

    let confidence = parsed.data.confidence;
    if (confidence > 1 && confidence <= 100) {
      confidence = confidence / 100;
    }
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      return null;
    }

    return { predictedDefectType, confidence };
  } catch {
    return null;
  }
}
