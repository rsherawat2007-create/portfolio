import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { validateCsrfOrigin } from "@/lib/csrf";

const SESSION_COOKIE_NAME = "portfolio_admin_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    const fallback = "dev-secret-key-for-portfolio-auth-32-chars-long!";
    return new TextEncoder().encode(fallback);
  }
  return new TextEncoder().encode(secret);
}

async function isSessionValid(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return Boolean(payload && typeof payload.userId === "string");
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. CSRF Protection for state-changing API endpoints
  if (pathname.startsWith("/api/")) {
    const method = request.method.toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (!validateCsrfOrigin(request)) {
        return NextResponse.json(
          {
            success: false,
            error: "Cross-Site Request Forgery (CSRF) validation failed: untrusted request origin.",
          },
          { status: 403 }
        );
      }
    }
    return NextResponse.next();
  }

  // 2. Access Control for /manage dashboard routes
  if (pathname.startsWith("/manage")) {
    const authenticated = await isSessionValid(request);
    const isLoginPage = pathname === "/manage/login";

    // If visiting /manage/login and already authenticated, redirect to /manage
    if (isLoginPage && authenticated) {
      return NextResponse.redirect(new URL("/manage", request.url));
    }

    // If visiting protected /manage routes without valid session, redirect to /manage/login
    if (!isLoginPage && !authenticated) {
      const loginUrl = new URL("/manage/login", request.url);
      if (pathname !== "/manage") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/manage/:path*", "/api/:path*"],
};
