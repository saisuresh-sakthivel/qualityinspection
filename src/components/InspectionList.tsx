import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { InspectionListItem } from "@/types/models";

interface InspectionListProps {
  inspections: InspectionListItem[];
  filtered: boolean;
}

/**
 * Renders logged inspections with a thumbnail, final defect, and accept/override badge.
 */
export async function InspectionList({ inspections, filtered }: InspectionListProps) {
  const t = await getTranslations("Inspection");
  const tDefect = await getTranslations("DefectType");

  if (inspections.length === 0) {
    return <p>{filtered ? t("emptyFilter") : t("empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {inspections.map((inspection) => (
        <li
          key={inspection.id}
          className="flex items-center gap-4 rounded-lg border border-border bg-muted p-4"
        >
          {/* The photo route checks the session cookie. The optimizer fetches without it. */}
          <Image
            unoptimized
            width={72}
            height={72}
            className="size-[4.5rem] rounded-md border border-border bg-surface object-cover"
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
                  ? "inline-block rounded-md border border-border bg-surface px-2 py-0.5 text-xs"
                  : "inline-block rounded-md bg-accent px-2 py-0.5 text-xs"
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
