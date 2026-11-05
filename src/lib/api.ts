import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { VisionProviderError } from "@/domain/errors";
import { AuthError, getCurrentUser, requireRole } from "@/lib/auth";
import type { SessionUser, UserRole } from "@/types/models";

/**
 * What the route is allowed to do.
 * Reads allow either signed-in role.
 * Writes and the analyze call allow only a Quality Engineer.
 */
export type AppApiAccess = "read" | "write" | "analyze";

type AppApiHandler<C> = (user: SessionUser, request: Request, context: C) => Promise<NextResponse>;

/**
 * Session and role gate for route handlers.
 * `write` and `analyze` always require a Quality Engineer, so a Production
 * Supervisor cannot classify a photo or persist a batch or inspection.
 * `read` allows either role unless `role` narrows that route further.
 */
export function makeAppApiCall<C = { params: Promise<Record<string, string>> }>(
  access: AppApiAccess,
  handler: AppApiHandler<C>,
  role?: UserRole,
): (request: Request, context: C) => Promise<NextResponse> {
  const requiredRole: UserRole | undefined = access === "read" ? role : "QUALITY_ENGINEER";

  return async (request, context) => {
    try {
      const user = requiredRole ? await requireRole(requiredRole) : await getCurrentUser();
      if (!user) {
        return errorResponse(401, "UNAUTHORIZED");
      }
      return await handler(user, request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

/**
 * JSON error body used by route handlers. The UI maps `code` through next-intl.
 */
export function errorResponse(status: number, code: string): NextResponse {
  return NextResponse.json({ code }, { status });
}

/**
 * Turns auth and validation failures into HTTP responses.
 * A vision provider error is returned unchanged. Other unknown errors stay generic.
 */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof VisionProviderError) {
    return NextResponse.json(error.body, { status: error.status });
  }
  if (error instanceof AuthError) {
    return errorResponse(error.status, error.message);
  }
  if (error instanceof ZodError) {
    return errorResponse(400, "INVALID_INPUT");
  }
  if (error instanceof Error) {
    if (error.message === "MISSING_API_KEY") {
      return errorResponse(500, "MISSING_API_KEY");
    }
    if (
      error.message === "VISION_FAILED" ||
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      return errorResponse(502, "VISION_FAILED");
    }
    if (error.message === "UNSUPPORTED_IMAGE") {
      return errorResponse(400, "UNSUPPORTED_IMAGE");
    }
  }
  return errorResponse(500, "GENERIC");
}
