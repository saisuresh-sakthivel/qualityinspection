import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { listInspections } from "@/app/api/inspections/route";
import { DefectFilter } from "@/components/DefectFilter";
import { InspectionList } from "@/components/InspectionList";
import { PageShell } from "@/components/PageShell";
import { isDefectType } from "@/domain/defects";
import type { DefectType } from "@/types/models";

interface InspectionsPageProps {
  searchParams: Promise<{ defect?: string }>;
}

/**
 * Lists logged inspections for both roles. Logging starts from a batch.
 * The query string and the list are request data, so they stream in.
 */
export default async function InspectionsPage({ searchParams }: InspectionsPageProps) {
  const t = await getTranslations("Inspection");

  return (
    <Suspense
      fallback={
        <PageShell title={t("listHeading")} description={t("listDescription")}>
          <p>{t("loading")}</p>
        </PageShell>
      }
    >
      <InspectionResults searchParams={searchParams} />
    </Suspense>
  );
}

/**
 * Applies the defect filter from the URL, then loads matching inspections.
 */
async function InspectionResults({ searchParams }: InspectionsPageProps) {
  const t = await getTranslations("Inspection");
  const { defect } = await searchParams;
  const selected: DefectType | undefined = defect && isDefectType(defect) ? defect : undefined;
  const inspections = await listInspections(selected);

  return (
    <PageShell title={t("listHeading")} description={t("listDescription")}>
      <DefectFilter selected={selected} />
      <InspectionList filtered={Boolean(selected)} inspections={inspections} />
    </PageShell>
  );
}
