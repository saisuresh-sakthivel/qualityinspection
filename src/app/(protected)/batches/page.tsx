import { getTranslations } from "next-intl/server";
import { QualityEngineerOnly } from "@/components/QualityEngineerOnly";
import { BatchForm } from "@/components/BatchForm";
import { BatchList } from "@/components/BatchList";
import { PageShell } from "@/components/PageShell";
import { getPrisma } from "@/lib/db";

/**
 * Quality Engineer batch list plus create form.
 */
export default async function BatchesPage() {
  const t = await getTranslations("Batch");
  const batches = await getPrisma().batch.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <QualityEngineerOnly>
      <PageShell title={t("heading")} description={t("description")}>
        <div className="stack">
          <BatchList
            batches={batches.map((batch) => ({
              id: batch.id,
              productName: batch.productName,
              productionLine: batch.productionLine,
            }))}
          />
          <BatchForm />
        </div>
      </PageShell>
    </QualityEngineerOnly>
  );
}
