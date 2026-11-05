"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { StyledButton } from "@/components/StyledButton";

interface ModalProps {
  title: string;
  titleId: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel: string;
  /** When set, the footer shows this action beside Close. */
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  /** Extra footer action placed beside Close, such as Inspection steps. */
  footer?: ReactNode;
  /** Stacks a later dialog above an earlier one. */
  layer?: 1 | 2 | 3;
}

/**
 * Shell for a dialog: children in the body, an icon close at the top right,
 * and Close plus an optional submit action along the bottom.
 */
export function Modal({
  title,
  titleId,
  children,
  onClose,
  closeLabel,
  onSubmit,
  submitLabel,
  submitDisabled = false,
  footer,
  layer = 1,
}: ModalProps) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-overlay p-4 ${layer === 3 ? "z-40" : layer === 2 ? "z-30" : "z-20"}`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col gap-4 overflow-auto rounded-lg border border-border bg-surface p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="m-0 text-xl font-semibold">
            {title}
          </h2>
          <button
            className="inline-flex cursor-pointer border-0 bg-transparent p-1 text-foreground hover:bg-accent"
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div>{children}</div>
        <div className="flex w-full items-stretch gap-3">
          {footer}
          {onSubmit ? (
            <StyledButton
              variant="primary"
              className="flex-1"
              onClick={onSubmit}
              disabled={submitDisabled}
            >
              {submitLabel}
            </StyledButton>
          ) : null}
          <StyledButton variant="secondary" className="flex-1" onClick={onClose}>
            {closeLabel}
          </StyledButton>
        </div>
      </div>
    </div>
  );
}
