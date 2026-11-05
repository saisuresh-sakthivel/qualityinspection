"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { errorTranslationKey } from "@/domain/errors";
import { ApiError, createBatch } from "@/lib/apiClient";

/**
 * Creates a batch through the QE-only API so a supervisor gets HTTP 403.
 */
export function BatchForm() {
  const t = useTranslations("Batch");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await createBatch({
        id: String(formData.get("id") ?? ""),
        productName: String(formData.get("productName") ?? ""),
        productionLine: String(formData.get("productionLine") ?? ""),
      });
      router.refresh();
    } catch (error) {
      const code = error instanceof ApiError ? error.code : "GENERIC";
      setError(tErrors(errorTranslationKey(code)));
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="stack card">
      <label className="field">
        <span>{t("id")}</span>
        <input name="id" placeholder="BATCH-003" required />
        <span>{t("idHint")}</span>
      </label>
      <label className="field">
        <span>{t("productName")}</span>
        <input name="productName" required />
      </label>
      <label className="field">
        <span>{t("productionLine")}</span>
        <input name="productionLine" required />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn-primary" type="submit" disabled={pending}>
        {t("create")}
      </button>
    </form>
  );
}
