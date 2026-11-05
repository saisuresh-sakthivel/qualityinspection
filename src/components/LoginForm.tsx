"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { error: null };

/**
 * Username and password form for the two seeded demo users.
 */
export function LoginForm() {
  const t = useTranslations("Auth");
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="stack">
      <label className="field">
        <span>{t("username")}</span>
        <input name="username" autoComplete="username" required />
      </label>
      <label className="field">
        <span>{t("password")}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state.error ? <p className="error">{t("invalid")}</p> : null}
      <button className="btn-primary" type="submit" disabled={pending}>
        {t("submit")}
      </button>
      <p className="hint">{t("hint")}</p>
    </form>
  );
}
