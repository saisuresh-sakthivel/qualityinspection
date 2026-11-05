import { getTranslations } from "next-intl/server";
import { listInspections } from "@/app/api/inspections/route";
import { DefectFilter } from "@/components/DefectFilter";
import { InspectionList } from "@/components/InspectionList";
import { LogInspection } from "@/components/LogInspection";
import { PageShell } from "@/components/PageShell";
import { isDefectType } from "@/domain/defects";
import type { DefectType } from "@/types/models";

interface InspectionsPageProps {
  searchParams: Promise<{ defect?: string }>;
}

/**
 * Lists logged inspections. The log-inspection control checks the role itself.
 */
export default async function InspectionsPage({
  searchParams,
}: InspectionsPageProps) {
  const t = await getTranslations("Inspection");
  const { defect } = await searchParams;
  const selected: DefectType | undefined =
    defect && isDefectType(defect) ? defect : undefined;
  const inspections = await listInspections(selected);

  return (
    <PageShell title={t("listHeading")} description={t("listDescription")}>
      <div className="list-toolbar">
        <DefectFilter selected={selected} />
        <LogInspection />
      </div>
      <InspectionList filtered={Boolean(selected)} inspections={inspections} />
    </PageShell>
  );
}
