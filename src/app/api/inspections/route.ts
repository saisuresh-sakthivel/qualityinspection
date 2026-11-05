import { NextResponse } from "next/server";
import { z } from "zod";
import { isDefectType, wasOverridden } from "@/domain/defects";
import { errorResponse, toErrorResponse } from "@/lib/api";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { readPendingClassification } from "@/lib/uploads";
import type { DefectType, InspectionListItem } from "@/types/models";

/**
 * Loads inspections for the list. Optional defect filter uses the final type.
 */
export async function listInspections(
  defect?: DefectType,
): Promise<InspectionListItem[]> {
  const inspections = await getPrisma().inspection.findMany({
    where: defect ? { finalDefectType: defect } : undefined,
    include: { inspector: { select: { name: true } } },
    orderBy: { inspectedAt: "desc" },
  });

  return inspections.flatMap((inspection) => {
    if (!isDefectType(inspection.finalDefectType)) {
      return [];
    }
    return [
      {
        id: inspection.id,
        batchId: inspection.batchId,
        finalDefectType: inspection.finalDefectType,
        wasOverridden: inspection.wasOverridden,
        inspectedAt: inspection.inspectedAt,
        inspectorName: inspection.inspector.name,
      },
    ];
  });
}

/**
 * Returns the inspection list for a signed-in user. Both roles may read it.
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, "UNAUTHORIZED");
    }

    const defect = new URL(request.url).searchParams.get("defect");
    const selected = defect && isDefectType(defect) ? defect : undefined;
    const inspections = await listInspections(selected);
    return NextResponse.json(
      inspections.map((inspection) => ({
        ...inspection,
        inspectedAt: inspection.inspectedAt.toISOString(),
      })),
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

const saveSchema = z.object({
  imageId: z.string().uuid(),
  finalDefectType: z.string().refine(isDefectType),
  comments: z.string().trim().max(1000).optional(),
});

/**
 * Saves an inspection from the stored AI result plus the engineer's final call.
 * AI fields are copied from the upload artifact and are not taken from the client.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await requireRole("QUALITY_ENGINEER");
    const input = saveSchema.parse(await request.json());
    const pending = await readPendingClassification(input.imageId);

    if (!pending || pending.inspectorId !== user.id) {
      return errorResponse(400, "INVALID_INPUT");
    }

    if (!isDefectType(input.finalDefectType)) {
      return errorResponse(400, "INVALID_INPUT");
    }

    const comments = input.comments ? input.comments : null;
    const inspection = await getPrisma().inspection.create({
      data: {
        batchId: pending.batchId,
        imagePath: pending.imagePath,
        aiPredictedDefectType: pending.aiPredictedDefectType,
        aiConfidence: pending.aiConfidence,
        finalDefectType: input.finalDefectType,
        wasOverridden: wasOverridden(
          pending.aiPredictedDefectType,
          input.finalDefectType,
        ),
        comments,
        inspectorId: user.id,
      },
    });

    return NextResponse.json({ id: inspection.id });
  } catch (error) {
    return toErrorResponse(error);
  }
}
