"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DefectType } from "@/types/models";

interface AiPredictionProps {
  defectType: DefectType;
  /** Model confidence from 0 to 1. */
  confidence: number;
}

/**
 * Shows the model label as a gradient pill beside a confidence bar.
 */
export function AiPrediction({ defectType, confidence }: AiPredictionProps) {
  const t = useTranslations("Inspection");
  const tDefect = useTranslations("DefectType");
  const percent = Math.round(confidence * 100);

  return (
    <div className="mx-auto flex w-fit flex-col items-center gap-4 rounded-md border border-on-primary p-7.5">
      <div className="inline-flex items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        <p className="m-0 font-semibold">{t("aiInspector")}</p>
      </div>
      <div className="flex w-fit items-center gap-4">
        <div className="inline-flex items-center rounded-full bg-gradient-to-r from-primary-hover via-primary to-primary-bright px-4 py-1.5 text-sm font-semibold text-on-primary">
          {tDefect(defectType)}
        </div>
        <div className="flex w-36 flex-col">
          <p id="ai-confidence-label" className="m-0 mb-px text-left text-sm leading-none">
            {t("confidence")}
          </p>
          <div
            className="h-2 overflow-hidden rounded-full border border-on-primary bg-muted"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-labelledby="ai-confidence-label"
          >
            <div
              className="h-full bg-gradient-to-r from-primary-hover via-primary to-primary-bright"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="m-0 mt-1 text-center text-sm leading-none">
            {t("confidenceValue", { value: percent })}
          </p>
        </div>
      </div>
    </div>
  );
}
