import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, toErrorResponse } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/db";

const createBatchSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^BATCH-[A-Za-z0-9]+$/, "INVALID_INPUT"),
  productName: z.string().trim().min(1).max(120),
  productionLine: z.string().trim().min(1).max(80),
});

/**
 * Creates a batch. Quality Engineers only — supervisors receive 403.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireRole("QUALITY_ENGINEER");
    const input = createBatchSchema.parse(await request.json());
    const batch = await getPrisma().batch.create({
      data: {
        id: input.id.toUpperCase(),
        productName: input.productName,
        productionLine: input.productionLine,
      },
    });
    return NextResponse.json({
      id: batch.id,
      productName: batch.productName,
      productionLine: batch.productionLine,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse(409, "BATCH_EXISTS");
    }
    return toErrorResponse(error);
  }
}
