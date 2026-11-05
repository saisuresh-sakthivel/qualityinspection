"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { ChevronDown, CloudUpload, FilePlus, X } from "lucide-react";
import { StyledButton } from "@/components/StyledButton";
import type { FormActionConfig, FormFieldSchema } from "@/types/form";

interface FormProps {
  schema: FormFieldSchema[];
  /** Shown above the fields when a screen names the form. */
  title?: string;
  /** Primary action. Login passes only this. */
  onSubmit?: FormActionConfig;
  /** Secondary action. Omitted when the screen has no cancel or close. */
  onCancel?: FormActionConfig;
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
  title,
  onSubmit,
  onCancel,
  error,
  className,
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
      {children}
      <FormActions onSubmit={onSubmit} onCancel={onCancel} />
    </>
  );

  if (!onSubmit?.action) {
    return <div className={className}>{body}</div>;
  }

  return (
    <form action={onSubmit.action} className={className}>
      {body}
    </form>
  );
}

/**
 * Renders the primary submit and, when configured, the secondary cancel.
 */
function FormActions({
  onSubmit,
  onCancel,
}: {
  onSubmit?: FormActionConfig;
  onCancel?: FormActionConfig;
}) {
  if (!onSubmit && !onCancel) {
    return null;
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-3">
      {onSubmit ? (
        <StyledButton
          type={onSubmit.action ? "submit" : "button"}
          variant="primary"
          size={onSubmit.size}
          className={onSubmit.className}
          disabled={onSubmit.disabled}
          onClick={onSubmit.onClick}
        >
          {onSubmit.label}
        </StyledButton>
      ) : null}
      {onCancel ? (
        <StyledButton
          type="button"
          variant="secondary"
          size={onCancel.size}
          className={onCancel.className}
          disabled={onCancel.disabled}
          onClick={onCancel.onClick}
        >
          {onCancel.label}
        </StyledButton>
      ) : null}
    </div>
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

  if (field.type === "file") {
    return (
      <div className="flex w-full flex-col gap-1.5">
        <FileDropzone field={field} required={required} onChange={onChange} />
        {field.error ? (
          <p className="text-sm text-danger" role="alert">
            {field.error}
          </p>
        ) : null}
      </div>
    );
  }

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
 * Drop target for a photo. A chosen image replaces the picker with a preview.
 */
function FileDropzone({
  field,
  required,
  onChange,
}: {
  field: FormFieldSchema;
  required: boolean;
  onChange?: (name: string, value: string | File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useRef<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current);
      }
    };
  }, []);

  /**
   * Keeps the preview in step with the file the screen will analyze.
   */
  function publish(file: File | null) {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }
    const next =
      file && file.type.startsWith("image/")
        ? { url: URL.createObjectURL(file), name: file.name }
        : null;
    previewUrl.current = next?.url ?? null;
    setPreview(next);
    onChange?.(field.name, file);
  }

  /**
   * Drops the photo and returns the select-file picker.
   */
  function clearPreview() {
    const input = inputRef.current;
    if (input) {
      input.value = "";
    }
    publish(null);
  }

  function allowDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(true);
  }

  return (
    <div
      className="flex flex-col items-center rounded-lg border border-border bg-muted px-6 py-12 text-center data-[drag=true]:border-primary data-[preview=true]:py-6"
      data-drag={dragOver || undefined}
      data-preview={preview ? true : undefined}
      onDragEnter={allowDrop}
      onDragOver={allowDrop}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        const file = event.dataTransfer.files?.[0] ?? null;
        const input = inputRef.current;
        if (input) {
          const transfer = new DataTransfer();
          if (file) {
            transfer.items.add(file);
          }
          input.files = transfer.files;
        }
        publish(file);
      }}
    >
      <input
        ref={inputRef}
        className="sr-only"
        name={field.name}
        type="file"
        accept={field.accept}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          publish(event.currentTarget.files?.[0] ?? null);
        }}
      />
      {preview ? (
        <div className="relative inline-block">
          {/* A local object URL cannot be served by the image optimizer. */}
          <img
            src={preview.url}
            alt={preview.name}
            className="h-36 w-auto max-w-full rounded-md border border-border object-contain"
          />
          <button
            type="button"
            className="absolute top-1 right-1 inline-flex size-6 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground"
            aria-label={field.clearLabel}
            onClick={clearPreview}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <>
          <CloudUpload className="size-12 text-primary" aria-hidden="true" />
          <p className="m-0 mt-4 text-xl font-semibold">{field.label}</p>
          {field.hint ? <p className="m-0 mt-1 text-sm text-subtle">{field.hint}</p> : null}
          {field.buttonLabel ? (
            <StyledButton
              variant="primary"
              className="mt-6"
              onClick={() => inputRef.current?.click()}
            >
              <FilePlus className="size-4" aria-hidden="true" />
              {field.buttonLabel}
              <ChevronDown className="size-4" aria-hidden="true" />
            </StyledButton>
          ) : null}
        </>
      )}
    </div>
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
