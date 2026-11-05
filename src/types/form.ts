/** Controls the shared form knows how to render. */
export type FormFieldType = "text" | "password" | "file" | "select" | "textarea";

/** Browser checks for one field. Omit the object when the field has none. */
export interface FormFieldValidation {
  required?: boolean;
}

/**
 * Submit or cancel control passed into the shared form.
 * Omit cancel when a screen only submits, such as login.
 */
export interface FormActionConfig {
  label: string;
  /** Native form action. The button submits the form. */
  action?: (formData: FormData) => void | Promise<void>;
  /** Click handler when the screen owns the action. */
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
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
  /** File fields use this as the label on the select button. */
  buttonLabel?: string;
  /** Accessible name for the control that clears a chosen file. */
  clearLabel?: string;
  autoComplete?: string;
  accept?: string;
  options?: FormFieldOption[];
  rows?: number;
  /** Shown under the control when the screen rejects the current value. */
  error?: string;
  /** Present when the screen owns the value, as on the inspection steps. */
  value?: string;
}
