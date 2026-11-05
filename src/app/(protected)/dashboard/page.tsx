import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { listInspections } from "@/app/api/inspections/route";
import { DashboardTables } from "@/components/DashboardTables";
import { PageShell } from "@/components/PageShell";
import { PageTransition } from "@/components/PageTransition";
import { computeInspectionKpis } from "@/domain/kpis";

/**
 * Aggregated inspection KPIs for both roles.
 * The counts are request data, so they stream in after the heading.
 */
export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  return (
    <PageTransition>
      <Suspense
        fallback={
          <PageShell title={t("heading")} description={t("description")}>
            <p>{t("loading")}</p>
          </PageShell>
        }
      >
        <DashboardResults />
      </Suspense>
    </PageTransition>
  );
}

/**
 * Loads every inspection and folds it into the dashboard tables.
 */
async function DashboardResults() {
  const t = await getTranslations("Dashboard");
  const kpis = computeInspectionKpis(await listInspections());

  return (
    <PageShell title={t("heading")} description={t("description")}>
      <DashboardTables kpis={kpis} />
    </PageShell>
  );
}
