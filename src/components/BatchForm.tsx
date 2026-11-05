"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Form } from "@/components/Form";
import { errorTranslationKey } from "@/domain/errors";
import { ApiError, createBatch } from "@/lib/apiClient";
import type { FormFieldSchema } from "@/types/form";

/**
 * Creates a batch through the QE-only API so a supervisor gets HTTP 403.
 */
export function BatchForm() {
  const t = useTranslations("Batch");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const schema: FormFieldSchema[] = [
    {
      name: "id",
      type: "text",
      label: t("id"),
      hint: t("idHint"),
      placeholder: t("idPlaceholder"),
      validation: { required: true },
    },
    {
      name: "productName",
      type: "text",
      label: t("productName"),
      validation: { required: true },
    },
    {
      name: "productionLine",
      type: "text",
      label: t("productionLine"),
      validation: { required: true },
    },
  ];

  /**
   * Sends the schema fields to the batch API and refreshes the list.
   */
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
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : "GENERIC";
      setError(tErrors(errorTranslationKey(code)));
    } finally {
      setPending(false);
    }
  }

  return (
    <Form
      schema={schema}
      action={onSubmit}
      submitLabel={t("create")}
      pending={pending}
      error={error}
      className="flex max-w-xl flex-col gap-4 rounded-lg border border-border bg-muted p-4"
    />
  );
}
