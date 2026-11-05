import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, toErrorResponse } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import type { Batch } from "@/types/models";

/**
 * Every batch, including ones that already have inspections.
 * A batch can hold any number of unit inspections.
 */
export async function listBatches(): Promise<Batch[]> {
  const batches = await getPrisma().batch.findMany({
    orderBy: { id: "asc" },
  });

  return batches.map(toBatch);
}

/**
 * One batch for the inspection steps page. Missing ids return null.
 */
export async function getBatch(id: string): Promise<Batch | null> {
  const batch = await getPrisma().batch.findUnique({ where: { id } });
  return batch ? toBatch(batch) : null;
}

/**
 * Keeps the public batch shape free of Prisma fields.
 */
function toBatch(batch: {
  id: string;
  productName: string;
  productionLine: string;
}): Batch {
  return {
    id: batch.id,
    productName: batch.productName,
    productionLine: batch.productionLine,
  };
}

/**
 * Lists batches. Quality Engineers only.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await requireRole("QUALITY_ENGINEER");
    return NextResponse.json(await listBatches());
  } catch (error) {
    return toErrorResponse(error);
  }
}

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
