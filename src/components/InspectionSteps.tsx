"use client";

import { useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
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
type StepId = "upload" | "prediction";

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
 * Two inspection steps. One can be expanded while the other stays docked.
 * Step 2 stays locked until a prediction is rendered into it.
 */
export function InspectionSteps({ batchId }: InspectionStepsProps) {
  const t = useTranslations("Inspection");
  const tDefect = useTranslations("DefectType");
  const tErrors = useTranslations("Errors");
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [review, setReview] = useState<ClassifyResult | null>(null);
  const [openStep, setOpenStep] = useState<StepId | null>("upload");
  const [category, setCategory] = useState<DefectType | "">("");
  const [comments, setComments] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sameCategory, setSameCategory] = useState(false);
  const [categoryRequired, setCategoryRequired] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [confirming, setConfirming] = useState<Confirming | null>(null);
  const predictionBodyRef = useRef<HTMLDivElement>(null);
  const expandPrediction = useRef(false);

  const predicted = review?.prediction?.predictedDefectType ?? null;
  const uploadDone = review !== null;
  const finalType: DefectType | "" =
    confirming === "allow" && predicted
      ? predicted
      : confirming === "deny" && isDefectType(category)
        ? category
        : "";

  /**
   * Opens the clicked step and docks the other. A second click docks the open step.
   * Step 2 stays locked until analysis has rendered a prediction into it.
   */
  function toggleStep(step: StepId) {
    if (step === "prediction" && !review) {
      return;
    }
    setOpenStep((current) => (current === step ? null : step));
  }

  /**
   * Sends the photo to classify. The prediction is written into step 2 while that
   * step stays docked; expansion starts only after that content is in the DOM.
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
      expandPrediction.current = true;
      setReview({ imageId: body.imageId, prediction: body.prediction });
      setCategory("");
      setComments("");
      setSameCategory(false);
      setCategoryRequired(false);
      setShowOverride(false);
      setConfirming(null);
      setPending(false);
    } catch (caught) {
      setError(inspectionErrorMessage(caught, (key) => tErrors(key)));
      setPending(false);
    }
  }

  useLayoutEffect(() => {
    if (!expandPrediction.current || !review) {
      return;
    }
    const body = predictionBodyRef.current;
    if (!body?.querySelector("[data-prediction]")) {
      return;
    }
    // The docked step has to paint with the prediction inside it. Expanding in the
    // same frame skips the transition and opens onto an empty snapshot.
    let painted = 0;
    const laidOut = requestAnimationFrame(() => {
      painted = requestAnimationFrame(() => {
        expandPrediction.current = false;
        setOpenStep("prediction");
      });
    });
    return () => {
      cancelAnimationFrame(laidOut);
      cancelAnimationFrame(painted);
    };
  }, [review]);

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
        <StepSection
          title={t("stepUpload")}
          hint={uploadDone ? (file?.name ?? t("stepUploadHint")) : t("stepUploadHint")}
          open={openStep === "upload"}
          panelId="inspection-upload-panel"
          onToggle={() => toggleStep("upload")}
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

        <StepSection
          title={t("stepPrediction")}
          hint={uploadDone ? t("stepPredictionHint") : t("stepPredictionLocked")}
          open={openStep === "prediction"}
          locked={!uploadDone}
          panelId="inspection-prediction-panel"
          bodyRef={predictionBodyRef}
          onToggle={() => toggleStep("prediction")}
        >
          {uploadDone ? (
            <div className="flex flex-col items-center gap-4" data-prediction="">
              {predicted && review?.prediction ? (
                <AiPrediction defectType={predicted} confidence={review.prediction.confidence} />
              ) : (
                <p className="text-sm text-danger">{tErrors("predictionInvalid")}</p>
              )}
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
                    label: t("overwrite"),
                    onClick: overwrite,
                    disabled: pending,
                  }}
                  onCancel={{
                    label: t("acceptPrediction"),
                    onClick: acceptPrediction,
                    disabled: !predicted || pending,
                  }}
                />
              ) : (
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
              )}
            </div>
          ) : null}
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
 * One accordion row. The header expands or docks the body. A locked row cannot open.
 */
function StepSection({
  title,
  hint,
  open,
  locked = false,
  panelId,
  bodyRef,
  onToggle,
  children,
}: {
  title: string;
  hint: string;
  open: boolean;
  locked?: boolean;
  panelId: string;
  bodyRef?: Ref<HTMLDivElement>;
  onToggle: () => void;
  children?: ReactNode;
}) {
  const Icon = open ? ChevronUp : ChevronRight;
  const headingId = `${panelId}-heading`;

  return (
    <section
      className="border-t border-border px-6 py-5 first:border-t-0 data-[locked=true]:bg-muted"
      data-locked={locked ? "true" : undefined}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="m-0">
        <button
          type="button"
          className="flex w-full cursor-pointer items-start justify-between gap-4 border-0 bg-transparent p-0 text-left text-foreground disabled:cursor-not-allowed"
          aria-expanded={open}
          aria-controls={panelId}
          disabled={locked}
          onClick={onToggle}
        >
          <span>
            <span className={open ? "block text-xl font-semibold" : "block text-lg font-semibold"}>
              {title}
            </span>
            <span className="mt-1 block text-sm font-normal">{hint}</span>
          </span>
          <Icon className="mt-1 shrink-0" aria-hidden="true" />
        </button>
      </h2>
      <div id={panelId} className="step-panel" data-open={open ? "true" : "false"}>
        <div ref={bodyRef} className="min-h-0 overflow-hidden" inert={open ? undefined : true}>
          {children ? <div className="pt-4">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
