import { NextResponse } from "next/server";
// Switch providers by importing classifyUnitImage from "@/ai/openai" instead.
import { classifyUnitImage } from "@/ai/openai";
import { errorResponse, toErrorResponse } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import {
  extensionForMime,
  storePendingClassification,
} from "@/lib/uploads";

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

    const prediction = await classifyUnitImage(bytes, file.type);
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
