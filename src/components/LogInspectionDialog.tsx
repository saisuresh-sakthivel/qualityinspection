"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { InspectionForm } from "@/components/InspectionForm";
import type { Batch } from "@/types/models";

interface LogInspectionDialogProps {
  batches: Batch[];
}

/**
 * Quality Engineer dialog: pick an uninspected batch, then upload and confirm the vision result.
 */
export function LogInspectionDialog({ batches }: LogInspectionDialogProps) {
  const t = useTranslations("Inspection");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [batchId, setBatchId] = useState("");

  function close() {
    setOpen(false);
    setBatchId("");
  }

  /**
   * Closes the dialog after a successful save and reloads the list.
   */
  function handleSaved() {
    close();
    router.refresh();
  }

  return (
    <>
      <button className="btn-primary" type="button" onClick={() => setOpen(true)}>
        {t("logInspection")}
      </button>
      {open ? (
        <div className="modal-backdrop" onClick={close}>
          <div
            className="modal stack"
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-inspection-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="row-actions">
              <h2 id="log-inspection-title">{t("logInspection")}</h2>
              <button className="btn-secondary" type="button" onClick={close}>
                {t("close")}
              </button>
            </div>
            {batches.length === 0 ? (
              <p>{t("noOpenBatches")}</p>
            ) : (
              <>
                <label className="field">
                  <span>{t("batch")}</span>
                  <select
                    value={batchId}
                    onChange={(event) => setBatchId(event.target.value)}
                  >
                    <option value="">{t("chooseBatch")}</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.id} — {batch.productName}
                      </option>
                    ))}
                  </select>
                </label>
                {batchId ? (
                  <InspectionForm
                    key={batchId}
                    batches={batches}
                    lockedBatchId={batchId}
                    onSaved={handleSaved}
                  />
                ) : (
                  <p className="text-sm">{t("selectBatchPrompt")}</p>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
