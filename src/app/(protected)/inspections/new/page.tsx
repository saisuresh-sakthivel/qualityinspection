import { getTranslations } from "next-intl/server";
import { QualityEngineerOnly } from "@/components/QualityEngineerOnly";
import { InspectionForm } from "@/components/InspectionForm";
import { PageShell } from "@/components/PageShell";
import { getPrisma } from "@/lib/db";

interface NewInspectionPageProps {
  searchParams: Promise<{ batchId?: string }>;
}

/**
 * Upload and vision confirmation flow for a selected batch.
 */
export default async function NewInspectionPage({
  searchParams,
}: NewInspectionPageProps) {
  const t = await getTranslations("Inspection");
  const { batchId } = await searchParams;
  const batches = await getPrisma().batch.findMany({ orderBy: { id: "asc" } });

  return (
    <QualityEngineerOnly>
      <PageShell title={t("newHeading")} description={t("newDescription")}>
        <InspectionForm
          initialBatchId={batchId}
          batches={batches.map((batch) => ({
            id: batch.id,
            productName: batch.productName,
            productionLine: batch.productionLine,
          }))}
        />
      </PageShell>
    </QualityEngineerOnly>
  );
}
