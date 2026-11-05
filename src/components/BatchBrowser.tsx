"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [selected, setSelected] = useState<Batch | null>(null);

  useEffect(() => {
    if (!selected) {
      return;
    }
    router.prefetch(`/batches/${encodeURIComponent(selected.id)}/inspect`);
  }, [router, selected]);

  /**
   * Closes the details dialog before leaving, so it is gone when inspection steps open.
   * The route is prefetched while the dialog is open, so the fade can start immediately.
   */
  function logInspection(batchId: string) {
    flushSync(() => {
      setSelected(null);
    });
    router.push(`/batches/${encodeURIComponent(batchId)}/inspect`, {
      transitionTypes: ["page-fade"],
    });
  }

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
                onClick={() => logInspection(selected.id)}
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
