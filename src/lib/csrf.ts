import { NextRequest } from "next/server";

/**
 * Validates request Origin/Referer for state-changing requests (POST, PUT, PATCH, DELETE)
 * to provide defense-in-depth against Cross-Site Request Forgery (CSRF).
 */
export function validateCsrfOrigin(req: NextRequest): boolean {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");

  if (!host) {
    return true;
  }

  // If origin header is present, verify host match
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      return originHost === host;
    } catch {
      return false;
    }
  }

  // If origin is missing (e.g. certain browser configurations or non-cross-site requests), verify referer if present
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      return refererHost === host;
    } catch {
      return false;
    }
  }

  // If neither origin nor referer is supplied (e.g. CLI curl or server-to-server), requireAuth will still enforce cookie authentication
  return true;
}
