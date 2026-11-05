"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

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
  layer = 1,
}: ModalProps) {
  return (
    <div
      className="modal-backdrop"
      data-layer={layer}
      onClick={onClose}
    >
      <div
        className="modal stack"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div>{children}</div>
        <div className="modal-footer">
          {onSubmit ? (
            <button
              className="btn-primary"
              type="button"
              onClick={onSubmit}
              disabled={submitDisabled}
            >
              {submitLabel}
            </button>
          ) : null}
          <button className="btn-secondary" type="button" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
