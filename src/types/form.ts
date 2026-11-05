/** Controls the shared form knows how to render. */
export type FormFieldType = "text" | "password" | "file" | "select" | "textarea";

/** Browser checks for one field. Omit the object when the field has none. */
export interface FormFieldValidation {
  required?: boolean;
}

/** One choice for a select field. Labels are already translated. */
export interface FormFieldOption {
  value: string;
  label: string;
}

/**
 * One control described to the shared form.
 * The screen that builds the schema resolves labels from messages/en.json.
 */
export interface FormFieldSchema {
  name: string;
  type: FormFieldType;
  label: string;
  validation?: FormFieldValidation;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  accept?: string;
  options?: FormFieldOption[];
  rows?: number;
  /** Shown under the control when the screen rejects the current value. */
  error?: string;
  /** Present when the screen owns the value, as on the inspection steps. */
  value?: string;
}
