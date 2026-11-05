import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Hashes a demo password with scrypt. Stored form is `salt:hash`.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Checks a password against a `salt:hash` string from the database.
 */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) {
    return false;
  }

  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
