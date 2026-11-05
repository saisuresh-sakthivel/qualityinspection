import { NextResponse } from "next/server";
import { VisionProviderError } from "@/domain/errors";
import { AuthError } from "@/lib/auth";
import { ZodError } from "zod";

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
