"use server";

import { redirect } from "next/navigation";
import { clearSession, setSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export interface LoginState {
  error: "invalid" | null;
}

/**
 * Checks seeded credentials and starts a session. Wrong passwords stay on the form.
 */
export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await getPrisma().user.findUnique({ where: { username } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "invalid" };
  }

  await setSession(user.id, user.role);
  redirect("/batches");
}

/**
 * Ends the login session and returns to the login screen.
 */
export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}
