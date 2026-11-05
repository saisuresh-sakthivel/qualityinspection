"use client";

import { useTranslations } from "next-intl";
import type { Batch } from "@/types/models";

interface BatchDetailsProps {
  batch: Batch;
}

/**
 * Batch identity shown inside the details dialog.
 * Logging starts from the dialog footer.
 */
export function BatchDetails({ batch }: BatchDetailsProps) {
  const t = useTranslations("Batch");

  return (
    <dl className="m-0 grid grid-cols-[10rem_1fr] gap-x-4 gap-y-2">
      <dt className="text-sm">{t("id")}</dt>
      <dd className="m-0">{batch.id}</dd>
      <dt className="text-sm">{t("productName")}</dt>
      <dd className="m-0">{batch.productName}</dd>
      <dt className="text-sm">{t("productionLine")}</dt>
      <dd className="m-0">{batch.productionLine}</dd>
    </dl>
  );
}
