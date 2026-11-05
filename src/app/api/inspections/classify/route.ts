import { NextResponse } from "next/server";
import { classifyUnitImage } from "@/ai/openai";
import { errorResponse, makeAppApiCall } from "@/lib/api";
import { getPrisma } from "@/lib/db";
import { extensionForMime, storePendingClassification } from "@/lib/uploads";

export const maxDuration = 30;

/**
 * Uploads a unit photo and classifies it. Does not persist an inspection yet.
 * The wrapper allows this analyze call only for a Quality Engineer.
 */
export const POST = makeAppApiCall("analyze", async (user, request) => {
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
});
