"use client";

import { startTransition, useState, ViewTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { AiPrediction } from "@/components/AiPrediction";
import { Form } from "@/components/Form";
import { Modal } from "@/components/Modal";
import { StyledButton } from "@/components/StyledButton";
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
  const [categoryRequired, setCategoryRequired] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
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
      startTransition(() => {
        setReview({ imageId: body.imageId, prediction: body.prediction });
        setCategory("");
        setComments("");
        setSameCategory(false);
        setCategoryRequired(false);
        setShowOverride(false);
        setConfirming(null);
        setPending(false);
      });
    } catch (caught) {
      setError(inspectionErrorMessage(caught, (key) => tErrors(key)));
      setPending(false);
    }
  }

  /**
   * Keeps the model label and asks the engineer to confirm it.
   */
  function acceptPrediction() {
    if (!predicted) {
      return;
    }
    setSameCategory(false);
    setCategoryRequired(false);
    setError(null);
    setConfirming("allow");
  }

  /**
   * Saves a different category. The category is required; comments stay optional.
   */
  function overwrite() {
    if (!isDefectType(category)) {
      setCategoryRequired(true);
      setSameCategory(false);
      setConfirming(null);
      return;
    }
    if (predicted && category === predicted) {
      setCategoryRequired(false);
      setSameCategory(true);
      setConfirming(null);
      return;
    }
    setCategoryRequired(false);
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
      error: categoryRequired
        ? t("categoryRequired")
        : sameCategory
          ? t("sameAsPrediction")
          : undefined,
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
      <div className="flex max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-surface">
        <ViewTransition update="step-resize">
          <StepSection
            title={t("stepUpload")}
            hint={uploadDone ? (file?.name ?? t("stepUploadHint")) : t("stepUploadHint")}
            state={uploadDone ? "done" : "open"}
            transitionName="inspection-upload"
          >
            <Form
              className="flex w-full flex-col gap-4"
              error={error}
              schema={[
                {
                  name: "image",
                  type: "file",
                  label: t("dropTitle"),
                  hint: t("dropHint"),
                  buttonLabel: t("selectFile"),
                  clearLabel: t("removePhoto"),
                  accept: "image/jpeg,image/png,image/webp",
                },
              ]}
              onChange={(_name, value) => {
                setFile(value instanceof File ? value : null);
                setError(null);
              }}
              onSubmit={{
                label: pending ? t("analyzing") : t("analyze"),
                onClick: analyze,
                disabled: pending || !file,
                className: "mx-auto",
              }}
            />
          </StepSection>
        </ViewTransition>

        <ViewTransition update="step-resize">
          <StepSection
            title={t("stepPrediction")}
            hint={uploadDone ? t("stepPredictionHint") : t("stepPredictionLocked")}
            state={uploadDone ? "open" : "locked"}
            transitionName="inspection-prediction"
          >
            <div className="flex flex-col items-center gap-4">
              {predicted && review?.prediction ? (
                <AiPrediction defectType={predicted} confidence={review.prediction.confidence} />
              ) : (
                <p className="text-sm text-danger">{tErrors("predictionInvalid")}</p>
              )}
              <div className="flex items-center gap-3">
                <StyledButton
                  variant="primary"
                  disabled={!predicted || pending}
                  onClick={acceptPrediction}
                >
                  {t("allow")}
                </StyledButton>
                <StyledButton
                  variant="secondary"
                  disabled={!predicted || pending}
                  onClick={() => setShowOverride(true)}
                >
                  {t("deny")}
                </StyledButton>
              </div>
              {showOverride ? (
                <Form
                  className="flex w-full max-w-xl flex-col gap-4"
                  schema={reviewSchema}
                  onChange={(name, value) => {
                    if (typeof value !== "string") {
                      return;
                    }
                    if (name === "category") {
                      setCategory(isDefectType(value) ? value : "");
                      setSameCategory(false);
                      setCategoryRequired(false);
                      return;
                    }
                    setComments(value);
                  }}
                  onSubmit={{
                    label: t("acceptPrediction"),
                    onClick: acceptPrediction,
                    disabled: !predicted || pending,
                  }}
                  onCancel={{
                    label: t("overwrite"),
                    onClick: overwrite,
                    disabled: pending,
                  }}
                />
              ) : null}
            </div>
          </StepSection>
        </ViewTransition>
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
          <div className="flex max-w-xl flex-col gap-4">
            <p>{t("confirmBody", { category: tDefect(finalType) })}</p>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
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
  transitionName,
  children,
}: {
  title: string;
  hint: string;
  state: "open" | "done" | "locked";
  /** Stable view-transition name so this step can enter and exit on its own. */
  transitionName: string;
  children?: ReactNode;
}) {
  const Icon = state === "open" ? ChevronUp : ChevronRight;

  return (
    <section
      className="border-t border-border px-6 py-5 first:border-t-0 data-[state=locked]:bg-muted"
      data-state={state}
      aria-disabled={state === "locked"}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {state === "open" ? (
            <h2 className="m-0 text-xl font-semibold">{title}</h2>
          ) : (
            <p className="m-0 text-lg font-semibold text-foreground">{title}</p>
          )}
          <p className="text-sm">{hint}</p>
        </div>
        <Icon aria-hidden="true" />
      </div>
      {state === "open" ? (
        <ViewTransition name={transitionName} enter="step-enter" exit="step-exit">
          <div className="mt-4">{children}</div>
        </ViewTransition>
      ) : null}
    </section>
  );
}
