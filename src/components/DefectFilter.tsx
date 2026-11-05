import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { DEFECT_TYPES } from "@/domain/defects";
import type { DefectType } from "@/types/models";

interface DefectFilterProps {
  selected?: DefectType;
}

/**
 * Links that filter the inspection list by final defect type.
 */
export async function DefectFilter({ selected }: DefectFilterProps) {
  const t = await getTranslations("Inspection");
  const tDefect = await getTranslations("DefectType");

  return (
    <nav className="mb-4 flex flex-wrap items-center gap-2" aria-label={t("filterLabel")}>
      <span className="text-sm">{t("filterLabel")}</span>
      <Link
        href="/inspections"
        aria-current={selected ? undefined : "page"}
        className="rounded-md border border-border bg-surface px-2.5 py-1 text-sm text-foreground no-underline hover:bg-accent aria-[current=page]:bg-accent"
      >
        {t("filterAll")}
      </Link>
      {DEFECT_TYPES.map((type) => (
        <Link
          key={type}
          href={`/inspections?defect=${encodeURIComponent(type)}`}
          aria-current={selected === type ? "page" : undefined}
          className="rounded-md border border-border bg-surface px-2.5 py-1 text-sm text-foreground no-underline hover:bg-accent aria-[current=page]:bg-accent"
        >
          {tDefect(type)}
        </Link>
      ))}
    </nav>
  );
}
