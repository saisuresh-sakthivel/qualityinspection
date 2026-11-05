import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSessionUserId, SESSION_COOKIE } from "@/lib/session-token";

/**
 * Sends anonymous visitors to login, and signed-in visitors away from the login page.
 * Runs before any page render. API routes stay on the handlers so they can return 401/403.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const signedIn = Boolean(token && readSessionUserId(token));
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    if (signedIn) {
      return NextResponse.redirect(new URL("/batches", request.url));
    }
    return NextResponse.next();
  }

  if (!signedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
