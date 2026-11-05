"use client";

import type { ChangeEvent, ReactNode } from "react";
import type { FormFieldSchema } from "@/types/form";

interface FormProps {
  schema: FormFieldSchema[];
  /** Shown above the fields when a screen names the form. */
  title?: string;
  /** Native submit. Omitted when the screen handles actions itself. */
  action?: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  pending?: boolean;
  error?: string | null;
  className?: string;
  /** Extra utilities for the submit control, such as a full-width login button. */
  submitClassName?: string;
  children?: ReactNode;
  /** Fired for controlled fields and file inputs. */
  onChange?: (name: string, value: string | File | null) => void;
}

/**
 * Renders inputs from a schema so every screen shares one field layout.
 */
export function Form({
  schema,
  title,
  action,
  submitLabel,
  pending = false,
  error,
  className,
  submitClassName,
  children,
  onChange,
}: FormProps) {
  const body = (
    <>
      {title ? <h2 className="m-0 text-xl font-semibold">{title}</h2> : null}
      {schema.map((field) => (
        <FormField key={field.name} field={field} onChange={onChange} />
      ))}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {submitLabel ? (
        <button
          className={`inline-block cursor-pointer rounded-md border border-primary bg-primary px-4 py-2 font-sans text-on-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-[0.55] ${submitClassName ?? "text-sm"}`}
          type="submit"
          disabled={pending}
        >
          {submitLabel}
        </button>
      ) : null}
      {children}
    </>
  );

  if (!action) {
    return <div className={className}>{body}</div>;
  }

  return (
    <form action={action} className={className}>
      {body}
    </form>
  );
}

/**
 * Picks the control that matches the schema type.
 */
function FormField({
  field,
  onChange,
}: {
  field: FormFieldSchema;
  onChange?: (name: string, value: string | File | null) => void;
}) {
  const required = field.validation?.required ?? false;
  const invalid = Boolean(field.error);

  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-left text-base font-bold">{field.label}</span>
      {renderControl(field, required, invalid, onChange)}
      {field.hint ? <span className="text-sm">{field.hint}</span> : null}
      {field.error ? (
        <p className="text-sm text-danger" role="alert">
          {field.error}
        </p>
      ) : null}
    </label>
  );
}

const controlClass =
  "rounded-md border border-border bg-surface px-3 py-2 font-sans text-base text-foreground";

/**
 * Text and password stay native inputs so a form action can read FormData.
 * A value on the schema switches that control to the screen's state.
 */
function renderControl(
  field: FormFieldSchema,
  required: boolean,
  invalid: boolean,
  onChange?: (name: string, value: string | File | null) => void,
) {
  if (field.type === "textarea") {
    return (
      <textarea
        className={controlClass}
        name={field.name}
        rows={field.rows ?? 3}
        required={required}
        aria-invalid={invalid || undefined}
        {...controlledValue(field, onChange)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        className={controlClass}
        name={field.name}
        required={required}
        aria-invalid={invalid || undefined}
        {...controlledValue(field, onChange)}
      >
        {field.placeholder ? <option value="">{field.placeholder}</option> : null}
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "file") {
    return (
      <input
        className={controlClass}
        name={field.name}
        type="file"
        accept={field.accept}
        required={required}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(field.name, event.currentTarget.files?.[0] ?? null);
        }}
      />
    );
  }

  return (
    <input
      className={controlClass}
      name={field.name}
      type={field.type === "password" ? "password" : "text"}
      placeholder={field.placeholder}
      autoComplete={field.autoComplete}
      required={required}
      aria-invalid={invalid || undefined}
      {...controlledValue(field, onChange)}
    />
  );
}

/**
 * Uncontrolled fields omit value so the browser can submit them.
 */
function controlledValue(
  field: FormFieldSchema,
  onChange?: (name: string, value: string | File | null) => void,
) {
  if (field.value === undefined) {
    return {};
  }
  return {
    value: field.value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onChange?.(field.name, event.currentTarget.value);
    },
  };
}
