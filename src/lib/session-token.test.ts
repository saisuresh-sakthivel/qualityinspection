import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { encodeSession, readSession } from "@/lib/session-token";

process.env.AUTH_SECRET ??= "test-secret";

describe("session token", () => {
  it("keeps the role that was signed at login", () => {
    const token = encodeSession("user-1", "PRODUCTION_SUPERVISOR");
    expect(readSession(token)).toMatchObject({
      userId: "user-1",
      role: "PRODUCTION_SUPERVISOR",
    });
  });

  it("rejects a cookie whose role was edited after signing", () => {
    const token = encodeSession("user-1", "PRODUCTION_SUPERVISOR");
    const [body, signature] = token.split(".");
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      role: string;
    };
    payload.role = "QUALITY_ENGINEER";
    const forged = `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${signature}`;
    expect(readSession(forged)).toBeNull();
  });

  it("treats a cookie from before roles were stored as having no role", () => {
    const body = Buffer.from(
      JSON.stringify({ userId: "user-1", exp: Date.now() + 60_000 }),
    ).toString("base64url");
    const signature = createHmac("sha256", process.env.AUTH_SECRET ?? "")
      .update(body)
      .digest("base64url");
    expect(readSession(`${body}.${signature}`)).toEqual({ userId: "user-1", role: null });
  });
});
