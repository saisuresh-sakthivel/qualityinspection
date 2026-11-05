import { cookies } from "next/headers";
import { connection } from "next/server";
import { getPrisma } from "@/lib/db";
import {
  encodeSession,
  readSessionUserId,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session-token";
import type { SessionUser, UserRole } from "@/types/models";

/**
 * Stores the signed session cookie after a successful login.
 */
export async function setSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the login session. Called from logout.
 */
export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/**
 * Loads the signed-in user, or null when the cookie is missing or stale.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  // Cookie expiry uses the clock, so this must run on a dynamic request.
  await connection();
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const userId = readSessionUserId(token);
  if (!userId) {
    return null;
  }

  const user = await getPrisma().user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, name: true, role: true },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };
}

/**
 * Server-side role gate. Route handlers turn this into 401/403.
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError(401, "UNAUTHORIZED");
  }
  if (user.role !== role) {
    throw new AuthError(403, "FORBIDDEN");
  }
  return user;
}

/** HTTP-mappable auth failure from requireRole. */
export class AuthError extends Error {
  constructor(
    public readonly status: 401 | 403,
    code: "UNAUTHORIZED" | "FORBIDDEN",
  ) {
    super(code);
  }
}
