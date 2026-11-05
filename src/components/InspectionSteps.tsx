"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronUp, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Form } from "@/components/Form";
import { Modal } from "@/components/Modal";
import { DEFECT_TYPES, isDefectType } from "@/domain/defects";
import { errorTranslationKey } from "@/domain/errors";
import { ApiError, classifyInspection, saveInspection } from "@/lib/apiClient";
import type { FormFieldSchema } from "@/types/form";
import type { DefectType, VisionPrediction } from "@/types/models";

interface InspectionStepsProps {
  batchId: string;
}

interface ClassifyResult {
  imageId: string;
  prediction: VisionPrediction | null;
}

type Confirming = "allow" | "deny";

/**
 * Prefers the provider message over the generic code map.
 */
function inspectionErrorMessage(
  caught: unknown,
  translate: (key: ReturnType<typeof errorTranslationKey>) => string,
): string {
  if (caught instanceof ApiError && caught.detail) {
    return caught.detail;
  }
  const code = caught instanceof ApiError ? caught.code : "GENERIC";
  return translate(errorTranslationKey(code));
}

/**
 * Two inspection steps. The prediction step stays closed until analysis succeeds.
 */
export function InspectionSteps({ batchId }: InspectionStepsProps) {
  const t = useTranslations("Inspection");
  const tDefect = useTranslations("DefectType");
  const tErrors = useTranslations("Errors");
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [review, setReview] = useState<ClassifyResult | null>(null);
  const [category, setCategory] = useState<DefectType | "">("");
  const [comments, setComments] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sameCategory, setSameCategory] = useState(false);
  const [confirming, setConfirming] = useState<Confirming | null>(null);

  const predicted = review?.prediction?.predictedDefectType ?? null;
  const uploadDone = review !== null;
  const finalType: DefectType | "" =
    confirming === "allow" && predicted
      ? predicted
      : confirming === "deny" && isDefectType(category)
        ? category
        : "";

  /**
   * Sends the photo to classify. A successful response docks upload and opens prediction.
   */
  async function analyze() {
    if (!file) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("batchId", batchId);
      formData.set("image", file);
      const body = await classifyInspection(formData);
      setReview({ imageId: body.imageId, prediction: body.prediction });
      setCategory("");
      setSameCategory(false);
      setConfirming(null);
    } catch (caught) {
      setError(inspectionErrorMessage(caught, (key) => tErrors(key)));
    } finally {
      setPending(false);
    }
  }

  /**
   * Allow keeps the model label. Deny requires a different category.
   */
  function choose(next: Confirming) {
    if (next === "allow") {
      if (!predicted) {
        return;
      }
      setSameCategory(false);
      setError(null);
      setConfirming("allow");
      return;
    }
    if (!isDefectType(category)) {
      return;
    }
    if (predicted && category === predicted) {
      setSameCategory(true);
      setConfirming(null);
      window.alert(t("sameAsPrediction"));
      return;
    }
    setSameCategory(false);
    setError(null);
    setConfirming("deny");
  }

  /**
   * Persists the inspection, then shows the inspection list.
   */
  async function confirmYes() {
    if (!review || !isDefectType(finalType)) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await saveInspection({
        imageId: review.imageId,
        finalDefectType: finalType,
        comments,
      });
      router.push("/inspections");
    } catch (caught) {
      setError(inspectionErrorMessage(caught, (key) => tErrors(key)));
      setPending(false);
    }
  }

  const reviewSchema: FormFieldSchema[] = [
    {
      name: "category",
      type: "select",
      label: t("category"),
      placeholder: t("chooseCategory"),
      value: category,
      error: sameCategory ? t("sameAsPrediction") : undefined,
      options: DEFECT_TYPES.map((type) => ({
        value: type,
        label: tDefect(type),
      })),
    },
    {
      name: "comments",
      type: "textarea",
      label: t("comments"),
      rows: 3,
      value: comments,
    },
  ];

  return (
    <>
      <div className="accordion">
        <StepSection
          title={t("stepUpload")}
          hint={uploadDone ? (file?.name ?? t("stepUpload")) : t("stepUploadHint")}
          state={uploadDone ? "done" : "open"}
        >
          <Form
            className="stack"
            error={error}
            schema={[
              {
                name: "image",
                type: "file",
                label: t("image"),
                accept: "image/jpeg,image/png,image/webp",
              },
            ]}
            onChange={(_name, value) => {
              setFile(value instanceof File ? value : null);
              setError(null);
            }}
          >
            <div className="step-actions">
              <button
                className="btn-primary with-icon"
                type="button"
                disabled={pending || !file}
                onClick={analyze}
              >
                {pending ? <Loader2 className="spin" aria-hidden="true" /> : null}
                {pending ? t("analyzing") : t("analyze")}
              </button>
            </div>
          </Form>
        </StepSection>

        <StepSection
          title={t("stepPrediction")}
          hint={uploadDone ? t("stepPredictionHint") : t("stepPredictionLocked")}
          state={uploadDone ? "open" : "locked"}
        >
          <div className="stack">
            {predicted && review?.prediction ? (
              <p>
                {tDefect(predicted)}
                {` · ${t("confidence")} ${t("confidenceValue", {
                  value: Math.round(review.prediction.confidence * 100),
                })}`}
              </p>
            ) : (
              <p className="error">{tErrors("predictionInvalid")}</p>
            )}
            <Form
              className="stack"
              schema={reviewSchema}
              onChange={(name, value) => {
                if (typeof value !== "string") {
                  return;
                }
                if (name === "category") {
                  setCategory(isDefectType(value) ? value : "");
                  setSameCategory(false);
                  return;
                }
                setComments(value);
              }}
            >
              <div className="step-actions">
              <button
                className="btn-secondary"
                type="button"
                disabled={!predicted || pending}
                onClick={() => choose("allow")}
              >
                {t("allow")}
              </button>
              <button
                className="btn-secondary"
                type="button"
                disabled={!isDefectType(category) || pending}
                onClick={() => choose("deny")}
              >
                {t("deny")}
              </button>
            </div>
            </Form>
          </div>
        </StepSection>
      </div>

      {confirming && isDefectType(finalType) ? (
        <Modal
          title={t("confirmTitle")}
          titleId="confirm-inspection-title"
          closeLabel={t("confirmNo")}
          onClose={() => {
            if (!pending) {
              setConfirming(null);
              setError(null);
            }
          }}
          onSubmit={confirmYes}
          submitLabel={t("confirmYes")}
          submitDisabled={pending}
        >
          <div className="stack">
            <p>{t("confirmBody", { category: tDefect(finalType) })}</p>
            {error ? <p className="error">{error}</p> : null}
          </div>
        </Modal>
      ) : null}
    </>
  );
}

/**
 * One accordion row. Locked and finished rows stay collapsed.
 */
function StepSection({
  title,
  hint,
  state,
  children,
}: {
  title: string;
  hint: string;
  state: "open" | "done" | "locked";
  children?: ReactNode;
}) {
  const Icon = state === "open" ? ChevronUp : ChevronRight;

  return (
    <section className="accordion-step" data-state={state} aria-disabled={state === "locked"}>
      <div className="accordion-heading">
        <div>
          {state === "open" ? <h2>{title}</h2> : <p className="accordion-title">{title}</p>}
          <p className="text-sm">{hint}</p>
        </div>
        <Icon aria-hidden="true" />
      </div>
      {state === "open" ? <div className="accordion-body">{children}</div> : null}
    </section>
  );
}
