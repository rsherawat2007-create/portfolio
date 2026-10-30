import { NextRequest } from "next/server";

/**
 * Validates request Origin/Referer for state-changing requests (POST, PUT, PATCH, DELETE)
 * to provide defense-in-depth against Cross-Site Request Forgery (CSRF).
 *
 * Requirements:
 * 1. Checks state-changing HTTP methods: POST, PUT, PATCH, DELETE.
 * 2. Compares request Origin or Referer against Host / X-Forwarded-Host header.
 * 3. Supports ALLOWED_ORIGIN and NEXT_PUBLIC_SITE_URL environment variables.
 * 4. Checks Sec-Fetch-Site: rejects cross-site requests.
 * 5. Returns false if origin is malformed or untrusted.
 */
export function validateCsrfOrigin(req: NextRequest): boolean {
  const method = req.method.toUpperCase();
  // Safe idempotent methods do not mutate state
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  // Check Sec-Fetch-Site header (browser-enforced metadata)
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return false;
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Helper to extract hostname + optional port from a URL string
  const getHostFromUrl = (urlStr: string): string | null => {
    try {
      return new URL(urlStr).host.toLowerCase();
    } catch {
      return null;
    }
  };

  // Build trusted host list
  const trustedHosts = new Set<string>();
  if (host) {
    // Handle comma-separated x-forwarded-host
    host.split(",").forEach((h) => trustedHosts.add(h.trim().toLowerCase()));
  }

  // Also trust environment configured site URLs
  const envUrls = [process.env.ALLOWED_ORIGIN, process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean) as string[];
  for (const envUrl of envUrls) {
    const envHost = getHostFromUrl(envUrl);
    if (envHost) trustedHosts.add(envHost);
  }

  // If no host information is available, allow safe continuation
  if (trustedHosts.size === 0) {
    return true;
  }

  // 1. Validate Origin header if present
  if (origin) {
    const originHost = getHostFromUrl(origin);
    if (!originHost) {
      return false; // Malformed origin
    }
    return trustedHosts.has(originHost);
  }

  // 2. If Origin is missing, validate Referer header if present
  if (referer) {
    const refererHost = getHostFromUrl(referer);
    if (!refererHost) {
      return false; // Malformed referer
    }
    return trustedHosts.has(refererHost);
  }

  // 3. Neither Origin nor Referer is present (e.g., direct CLI scripts, curl, same-origin GET navigation)
  // Non-browser or direct requests pass origin check; session cookies and requireAuth will still enforce authentication
  return true;
}

