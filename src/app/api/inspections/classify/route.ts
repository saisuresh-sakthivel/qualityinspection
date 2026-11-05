import { NextResponse } from "next/server";
import { errorResponse, toErrorResponse } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { extensionForMime, storePendingClassification } from "@/lib/uploads";
import type { VisionPrediction } from "@/types/models";
// import { classifyUnitImage } from "@/ai/openai";

/**
 * Fixed reply while the vision call is paused.
 * Restore the live model by uncommenting the import and the call below.
 */
const TEST_PREDICTION: VisionPrediction = {
  predictedDefectType: "Scratch",
  confidence: 0.85,
};

export const maxDuration = 30;

/**
 * Uploads a unit photo and classifies it. Does not persist an inspection yet.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await requireRole("QUALITY_ENGINEER");
    const form = await request.formData();
    const batchId = String(form.get("batchId") ?? "").trim();
    const file = form.get("image");

    if (!batchId || !(file instanceof File)) {
      return errorResponse(400, "INVALID_INPUT");
    }
    if (!extensionForMime(file.type)) {
      return errorResponse(400, "UNSUPPORTED_IMAGE");
    }

    const batch = await getPrisma().batch.findUnique({ where: { id: batchId } });
    if (!batch) {
      return errorResponse(404, "BATCH_NOT_FOUND");
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length === 0 || bytes.length > 6 * 1024 * 1024) {
      return errorResponse(400, "UNSUPPORTED_IMAGE");
    }

    // const prediction = await classifyUnitImage(bytes, file.type);
    const prediction = TEST_PREDICTION;
    const pending = await storePendingClassification(bytes, file.type, {
      batchId,
      inspectorId: user.id,
      aiPredictedDefectType: prediction?.predictedDefectType ?? null,
      aiConfidence: prediction?.confidence ?? null,
    });

    return NextResponse.json({
      imageId: pending.imageId,
      prediction,
      code: prediction ? null : "PREDICTION_INVALID",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
