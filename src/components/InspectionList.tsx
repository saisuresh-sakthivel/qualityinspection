import { getTranslations } from "next-intl/server";
import type { InspectionListItem } from "@/types/models";

interface InspectionListProps {
  inspections: InspectionListItem[];
  filtered: boolean;
}

/**
 * Renders logged inspections with a thumbnail, final defect, and accept/override badge.
 */
export async function InspectionList({
  inspections,
  filtered,
}: InspectionListProps) {
  const t = await getTranslations("Inspection");
  const tDefect = await getTranslations("DefectType");

  if (inspections.length === 0) {
    return <p>{filtered ? t("emptyFilter") : t("empty")}</p>;
  }

  return (
    <ul className="inspection-list">
      {inspections.map((inspection) => (
        <li key={inspection.id} className="card inspection-row">
          <img
            className="thumb"
            src={`/api/inspections/${inspection.id}/image`}
            alt={t("thumbnailAlt", { batch: inspection.batchId })}
          />
          <div>
            <strong>{tDefect(inspection.finalDefectType)}</strong>
            <p className="text-sm">
              {t("inspector")}: {inspection.inspectorName}
              {" · "}
              <time dateTime={inspection.inspectedAt.toISOString()}>
                {inspection.inspectedAt.toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </p>
            <span
              className={
                inspection.wasOverridden
                  ? "badge badge-overridden"
                  : "badge badge-accepted"
              }
            >
              {inspection.wasOverridden ? t("overridden") : t("accepted")}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
