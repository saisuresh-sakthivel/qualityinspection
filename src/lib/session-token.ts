import { createHmac, timingSafeEqual } from "node:crypto";
import type { UserRole } from "@/types/models";

/** Cookie set after a successful login. */
export const SESSION_COOKIE = "qi_session";

const MAX_AGE_SECONDS = 60 * 60 * 12;

interface SessionPayload {
  userId: string;
  role?: UserRole;
  exp: number;
}

/** Claims the proxy can trust without a database lookup. */
export interface SessionClaims {
  userId: string;
  role: UserRole | null;
}

/**
 * Accepts only roles this app issues. Anything else means the payload is not ours.
 */
function isUserRole(value: unknown): value is UserRole {
  return value === "QUALITY_ENGINEER" || value === "PRODUCTION_SUPERVISOR";
}

/**
 * Reads the signing secret. Login cannot mint a cookie without it.
 */
function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return secret;
}

/**
 * Signs a session body so the cookie cannot be edited in the browser.
 */
function sign(body: string): string {
  return createHmac("sha256", authSecret()).update(body).digest("base64url");
}

/**
 * Builds a signed session cookie. The role is taken from the database at login
 * and covered by the signature, so the browser cannot change it.
 */
export function encodeSession(userId: string, role: UserRole): string {
  const payload: SessionPayload = {
    userId,
    role,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/**
 * Returns the signed claims, or null when the signature, expiry, or role is invalid.
 * A cookie issued before roles were stored still yields a user id and a null role.
 */
export function readSession(token: string): SessionClaims | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);
  const actualBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || payload.exp < Date.now()) {
      return null;
    }
    if (payload.role !== undefined && !isUserRole(payload.role)) {
      return null;
    }
    return { userId: payload.userId, role: payload.role ?? null };
  } catch {
    return null;
  }
}

/**
 * Returns the user id when the cookie signature and expiry are valid.
 */
export function readSessionUserId(token: string): string | null {
  return readSession(token)?.userId ?? null;
}

/** Session lifetime in seconds. Shared by the cookie max-age. */
export const SESSION_MAX_AGE_SECONDS = MAX_AGE_SECONDS;
