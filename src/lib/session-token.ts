import { createHmac, timingSafeEqual } from "node:crypto";

/** Cookie set after a successful login. */
export const SESSION_COOKIE = "qi_session";

const MAX_AGE_SECONDS = 60 * 60 * 12;

interface SessionPayload {
  userId: string;
  exp: number;
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
 * Builds a signed session cookie value for a user id.
 */
export function encodeSession(userId: string): string {
  const payload: SessionPayload = {
    userId,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/**
 * Returns the user id when the cookie signature and expiry are valid.
 */
export function readSessionUserId(token: string): string | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);
  const actualBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (
    actualBuf.length !== expectedBuf.length ||
    !timingSafeEqual(actualBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.userId || payload.exp < Date.now()) {
      return null;
    }
    return payload.userId;
  } catch {
    return null;
  }
}

/** Session lifetime in seconds. Shared by the cookie max-age. */
export const SESSION_MAX_AGE_SECONDS = MAX_AGE_SECONDS;
