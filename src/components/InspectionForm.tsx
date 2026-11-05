"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DEFECT_TYPES } from "@/domain/defects";
import { errorTranslationKey } from "@/domain/errors";
import type { Batch, DefectType, VisionPrediction } from "@/types/models";

interface InspectionFormProps {
  batches: Batch[];
  initialBatchId?: string;
}

interface ClassifyResult {
  imageId: string;
  prediction: VisionPrediction | null;
  code: string | null;
}

/**
 * Uploads a photo, shows the vision result, then saves the human-confirmed inspection.
 */
export function InspectionForm({ batches, initialBatchId }: InspectionFormProps) {
  const t = useTranslations("Inspection");
  const tDefect = useTranslations("DefectType");
  const tErrors = useTranslations("Errors");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function onAnalyze(formData: FormData) {
    setPending(true);
    setError(null);
    setSavedId(null);
    setResult(null);
    try {
      const response = await fetch("/api/inspections/classify", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as ClassifyResult & { code?: string };
      if (!response.ok) {
        setError(tErrors(errorTranslationKey(body.code ?? "GENERIC")));
        return;
      }
      setResult({
        imageId: body.imageId,
        prediction: body.prediction,
        code: body.code,
      });
    } catch {
      setError(tErrors("generic"));
    } finally {
      setPending(false);
    }
  }

  async function onSave(formData: FormData) {
    if (!result) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: result.imageId,
          finalDefectType: String(formData.get("finalDefectType") ?? ""),
          comments: String(formData.get("comments") ?? ""),
        }),
      });
      const body = (await response.json()) as { id?: string; code?: string };
      if (!response.ok || !body.id) {
        setError(tErrors(errorTranslationKey(body.code ?? "GENERIC")));
        return;
      }
      setSavedId(body.id);
    } catch {
      setError(tErrors("generic"));
    } finally {
      setPending(false);
    }
  }

  const predicted = result?.prediction?.predictedDefectType;

  return (
    <div className="stack">
      <form action={onAnalyze} className="stack">
        <label className="field">
          <span>{t("batch")}</span>
          <select name="batchId" defaultValue={initialBatchId ?? ""} required>
            <option value="">{t("chooseBatch")}</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.id} — {batch.productName}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t("image")}</span>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" required />
        </label>
        {error && !result ? <p className="error">{error}</p> : null}
        <button className="btn-primary" type="submit" disabled={pending}>
          {t("analyze")}
        </button>
      </form>

      {result ? (
        <form action={onSave} className="stack card">
          <h2>{t("prediction")}</h2>
          {predicted ? (
            <p>
              {tDefect(predicted)}
              {result.prediction
                ? ` · ${t("confidence")} ${t("confidenceValue", {
                    value: Math.round(result.prediction.confidence * 100),
                  })}`
                : ""}
            </p>
          ) : (
            <p className="error">{tErrors("predictionInvalid")}</p>
          )}
          <label className="field">
            <span>{t("finalType")}</span>
            <select
              name="finalDefectType"
              defaultValue={predicted ?? ""}
              required
            >
              <option value="">{t("chooseType")}</option>
              {DEFECT_TYPES.map((type: DefectType) => (
                <option key={type} value={type}>
                  {tDefect(type)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("comments")}</span>
            <textarea name="comments" rows={3} />
          </label>
          {error ? <p className="error">{error}</p> : null}
          {savedId ? <p>{t("saved")}</p> : null}
          <button className="btn-primary" type="submit" disabled={pending || Boolean(savedId)}>
            {t("save")}
          </button>
        </form>
      ) : null}
    </div>
  );
}
