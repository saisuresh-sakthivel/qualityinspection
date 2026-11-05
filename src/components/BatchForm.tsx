"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { errorTranslationKey } from "@/domain/errors";

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
      const response = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: String(formData.get("id") ?? ""),
          productName: String(formData.get("productName") ?? ""),
          productionLine: String(formData.get("productionLine") ?? ""),
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { code?: string };
        setError(tErrors(errorTranslationKey(body.code ?? "GENERIC")));
        return;
      }
      router.refresh();
    } catch {
      setError(tErrors("generic"));
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
