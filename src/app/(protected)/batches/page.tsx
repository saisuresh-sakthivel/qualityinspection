import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { listBatches } from "@/app/api/batches/route";
import { BatchBrowser } from "@/components/BatchBrowser";
import { BatchForm } from "@/components/BatchForm";
import { PageShell } from "@/components/PageShell";
import { PageTransition } from "@/components/PageTransition";
import { getCurrentUser } from "@/lib/auth";

/**
 * Batch list for both roles. Logging and creating a batch stay with the Quality Engineer.
 * The list is read per request, so it streams in after the page heading.
 */
export default async function BatchesPage() {
  const t = await getTranslations("Batch");

  return (
    <PageTransition>
      <Suspense
        fallback={
          <PageShell title={t("heading")} description={t("description")}>
            <p>{t("loading")}</p>
          </PageShell>
        }
      >
        <BatchList />
      </Suspense>
    </PageTransition>
  );
}

/**
 * Loads every batch. The session decides whether the engineer actions are shown.
 */
async function BatchList() {
  const t = await getTranslations("Batch");
  const user = await getCurrentUser();
  const canLog = user?.role === "QUALITY_ENGINEER";
  const batches = await listBatches();

  return (
    <PageShell title={t("heading")} description={t("description")}>
      <div className="flex max-w-xl flex-col gap-4">
        <BatchBrowser batches={batches} canLog={canLog} />
        {canLog ? <BatchForm /> : null}
      </div>
    </PageShell>
  );
}
