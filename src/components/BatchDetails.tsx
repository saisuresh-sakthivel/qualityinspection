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
    <div className="stack">
      <dl className="detail-list">
        <dt>{t("id")}</dt>
        <dd>{batch.id}</dd>
        <dt>{t("productName")}</dt>
        <dd>{batch.productName}</dd>
        <dt>{t("productionLine")}</dt>
        <dd>{batch.productionLine}</dd>
      </dl>
      {canLog ? (
        <Link
          className="btn-primary"
          href={`/batches/${encodeURIComponent(batch.id)}/inspect`}
        >
          {tInspection("logInspection")}
        </Link>
      ) : null}
    </div>
  );
}
