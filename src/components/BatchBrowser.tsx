"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BatchDetails } from "@/components/BatchDetails";
import { Modal } from "@/components/Modal";
import { StyledButton } from "@/components/StyledButton";
import type { Batch } from "@/types/models";

interface BatchBrowserProps {
  batches: Batch[];
  canLog: boolean;
}

/**
 * Selects a batch and shows its details. Logging continues on the inspection steps page.
 */
export function BatchBrowser({ batches, canLog }: BatchBrowserProps) {
  const tBatch = useTranslations("Batch");
  const t = useTranslations("Inspection");
  const [selected, setSelected] = useState<Batch | null>(null);

  if (batches.length === 0) {
    return <p>{tBatch("empty")}</p>;
  }

  return (
    <>
      <ul className="flex max-w-xl flex-col gap-4">
        {batches.map((batch) => (
          <li key={batch.id}>
            <button
              className="block w-full cursor-pointer rounded-lg border border-border bg-muted p-4 text-left text-foreground hover:bg-surface"
              type="button"
              onClick={() => setSelected(batch)}
            >
              <strong>{batch.id}</strong>
              <p>
                {batch.productName} · {batch.productionLine}
              </p>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <Modal
          title={tBatch("details")}
          titleId="batch-details-title"
          closeLabel={t("close")}
          onClose={() => setSelected(null)}
          footer={
            canLog ? (
              <StyledButton
                variant="primary"
                className="flex-1"
                href={`/batches/${encodeURIComponent(selected.id)}/inspect`}
              >
                {t("logInspection")}
              </StyledButton>
            ) : null
          }
        >
          <BatchDetails batch={selected} />
        </Modal>
      ) : null}
    </>
  );
}
