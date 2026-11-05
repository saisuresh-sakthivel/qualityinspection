"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Form } from "@/components/Form";
import { login, type LoginState } from "@/app/login/actions";
import type { FormFieldSchema } from "@/types/form";

const initialState: LoginState = { error: null };

/**
 * Loads the shared form with the login schema from the login screen.
 */
export function LoginForm({ schema }: { schema: FormFieldSchema[] }) {
  const t = useTranslations("Auth");
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <Form
      schema={schema}
      action={action}
      submitLabel={t("submit")}
      pending={pending}
      error={state.error ? t("invalid") : null}
      className="stack"
    >
      <p className="hint">{t("hint")}</p>
    </Form>
  );
}
