import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession, SESSION_COOKIE } from "@/lib/session-token";

/**
 * Inspection steps are a Quality Engineer page. The id segment is the batch id.
 */
function isInspectPath(pathname: string): boolean {
  return /^\/batches\/[^/]+\/inspect$/.test(pathname);
}

/**
 * Sends anonymous visitors to login, and signed-in visitors away from the login page.
 * A Production Supervisor who opens an inspect URL is sent back to the batch list
 * before the page renders. The role comes from the signed cookie, so editing it fails the signature.
 * API routes stay on the handlers so they can return 401/403.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? readSession(token) : null;
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/batches", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isInspectPath(pathname) && session.role !== "QUALITY_ENGINEER") {
    return NextResponse.redirect(new URL("/batches", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
