"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Batch } from "@/types/models";

interface BatchDetailsProps {
  batch: Batch;
  /** Decided by the server before this component renders. */
  canLog: boolean;
}

/**
 * Batch identity plus the Quality Engineer link that starts a new inspection.
 */
export function BatchDetails({ batch, canLog }: BatchDetailsProps) {
  const t = useTranslations("Batch");
  const tInspection = useTranslations("Inspection");

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <dl className="m-0 grid grid-cols-[10rem_1fr] gap-x-4 gap-y-2">
        <dt className="text-sm">{t("id")}</dt>
        <dd className="m-0">{batch.id}</dd>
        <dt className="text-sm">{t("productName")}</dt>
        <dd className="m-0">{batch.productName}</dd>
        <dt className="text-sm">{t("productionLine")}</dt>
        <dd className="m-0">{batch.productionLine}</dd>
      </dl>
      {canLog ? (
        <Link
          className="inline-block cursor-pointer rounded-md border border-primary bg-primary px-4 py-2 font-sans text-sm text-on-primary no-underline hover:bg-primary-hover"
          href={`/batches/${encodeURIComponent(batch.id)}/inspect`}
        >
          {tInspection("logInspection")}
        </Link>
      ) : null}
    </div>
  );
}
