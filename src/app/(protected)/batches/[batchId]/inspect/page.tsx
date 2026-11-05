import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getBatch } from "@/app/api/batches/route";
import { InspectionSteps } from "@/components/InspectionSteps";
import { PageShell } from "@/components/PageShell";
import { QualityEngineerOnly } from "@/components/QualityEngineerOnly";

interface InspectPageProps {
  params: Promise<{ batchId: string }>;
}

/**
 * Quality Engineer steps for logging one inspection against a batch.
 * The batch id is request data, so the body streams in after the heading.
 */
export default async function InspectPage({ params }: InspectPageProps) {
  const t = await getTranslations("Inspection");

  return (
    <Suspense
      fallback={
        <PageShell title={t("stepsTitle")}>
          <p>{t("loading")}</p>
        </PageShell>
      }
    >
      <InspectGate params={params} />
    </Suspense>
  );
}

/**
 * Role check uses the session cookie, which cannot be part of the static shell.
 */
async function InspectGate({ params }: InspectPageProps) {
  const { batchId } = await params;

  return (
    <QualityEngineerOnly>
      <InspectBatch batchId={batchId} />
    </QualityEngineerOnly>
  );
}

/**
 * Loads the batch, then hands the id to the client steps.
 */
async function InspectBatch({ batchId }: { batchId: string }) {
  const t = await getTranslations("Inspection");
  const batch = await getBatch(batchId);

  if (!batch) {
    const errors = await getTranslations("Errors");
    return <PageShell title={t("stepsTitle")} description={errors("batchNotFound")} />;
  }

  return (
    <PageShell
      title={t("stepsTitle")}
      description={t("stepsFor", { batch: batch.id, product: batch.productName })}
    >
      <InspectionSteps batchId={batch.id} />
    </PageShell>
  );
}
