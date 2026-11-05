"use client";

import type { ChangeEvent, ReactNode } from "react";
import type { FormFieldSchema } from "@/types/form";

interface FormProps {
  schema: FormFieldSchema[];
  /** Native submit. Omitted when the screen handles actions itself. */
  action?: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  pending?: boolean;
  error?: string | null;
  className?: string;
  children?: ReactNode;
  /** Fired for controlled fields and file inputs. */
  onChange?: (name: string, value: string | File | null) => void;
}

/**
 * Renders inputs from a schema so every screen shares one field layout.
 */
export function Form({
  schema,
  action,
  submitLabel,
  pending = false,
  error,
  className,
  children,
  onChange,
}: FormProps) {
  const body = (
    <>
      {schema.map((field) => (
        <FormField key={field.name} field={field} onChange={onChange} />
      ))}
      {error ? <p className="error">{error}</p> : null}
      {submitLabel ? (
        <button className="btn-primary" type="submit" disabled={pending}>
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
    <label className="field">
      <span className="field-label">{field.label}</span>
      {renderControl(field, required, invalid, onChange)}
      {field.hint ? <span className="hint">{field.hint}</span> : null}
      {field.error ? (
        <p className="error" role="alert">
          {field.error}
        </p>
      ) : null}
    </label>
  );
}

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
    onChange: (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      onChange?.(field.name, event.currentTarget.value);
    },
  };
}
