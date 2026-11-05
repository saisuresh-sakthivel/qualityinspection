-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('QUALITY_ENGINEER', 'PRODUCTION_SUPERVISOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productionLine" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "aiPredictedDefectType" TEXT,
    "aiConfidence" DOUBLE PRECISION,
    "finalDefectType" TEXT NOT NULL,
    "wasOverridden" BOOLEAN NOT NULL,
    "comments" TEXT,
    "inspectorId" TEXT NOT NULL,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inspection_batchId_idx" ON "Inspection"("batchId");

-- CreateIndex
CREATE INDEX "Inspection_finalDefectType_idx" ON "Inspection"("finalDefectType");

-- CreateIndex
CREATE INDEX "Inspection_wasOverridden_idx" ON "Inspection"("wasOverridden");

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
