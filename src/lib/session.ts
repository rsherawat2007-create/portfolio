import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "portfolio_admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    const fallback = "dev-secret-key-for-portfolio-auth-32-chars-long!";
    return new TextEncoder().encode(fallback);
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: "admin";
  jti?: string;
  iat?: number;
  exp?: number;
}

/**
 * Checks optional Upstash Redis REST API if credentials are provided in environment.
 */
function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url: url.replace(/\/$/, ""), token };
  }
  return null;
}

/**
 * Records a revoked token identifier (jti) in shared persistent storage (PostgreSQL/SQLite via Prisma,
 * and Upstash Redis if configured).
 * Revocation records persist across multiple serverless/container instances.
 */
export async function revokeToken(jti?: string, userId?: string, expiresAt?: Date): Promise<void> {
  if (!jti) return;

  const expiry = expiresAt || new Date(Date.now() + SESSION_DURATION);

  // 1. If Redis is configured, write to Redis with TTL
  const redis = getRedisConfig();
  if (redis) {
    try {
      const ttlSeconds = Math.max(1, Math.ceil((expiry.getTime() - Date.now()) / 1000));
      const res = await fetch(`${redis.url}/setex/revoked:${encodeURIComponent(jti)}/${ttlSeconds}/1`, {
        headers: { Authorization: `Bearer ${redis.token}` },
      });
      if (!res.ok) {
        throw new Error(`Redis setex HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("[Session Storage Warning] Redis revocation write failed, using database:", (err as Error).message);
    }
  }

  // 2. Persist to shared database via Prisma
  try {
    await prisma.revokedToken.upsert({
      where: { jti },
      update: { revokedAt: new Date(), expiresAt: expiry },
      create: {
        jti,
        userId: userId || null,
        revokedAt: new Date(),
        expiresAt: expiry,
      },
    });

    // Opportunistically prune expired revocation records to keep storage compact
    const now = new Date();
    await prisma.revokedToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });
  } catch (err) {
    console.error("[Session Storage Error] Database token revocation write failed:", err);
  }
}

/**
 * Checks whether a token jti is revoked.
 *
 * SECURITY REQUIREMENT:
 * "Never silently accept a revoked token when the revocation service fails."
 * If the database/shared storage check fails with an error, this function FAILS CLOSED
 * (returns true -> treated as revoked) to prevent unauthorized access.
 */
export async function isTokenRevoked(jti?: string): Promise<boolean> {
  if (!jti) return false;

  // 1. Check Redis if available
  const redis = getRedisConfig();
  if (redis) {
    try {
      const res = await fetch(`${redis.url}/get/revoked:${encodeURIComponent(jti)}`, {
        headers: { Authorization: `Bearer ${redis.token}` },
      });
      if (!res.ok) {
        throw new Error(`Redis get HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data && data.result === "1") {
        return true;
      }
    } catch (err) {
      console.error("[Session Storage Warning] Redis check failed, checking database:", (err as Error).message);
    }
  }

  // 2. Check Database via Prisma
  try {
    const record = await prisma.revokedToken.findUnique({
      where: { jti },
      select: { id: true, expiresAt: true },
    });

    if (record) {
      return true;
    }

    return false;
  } catch (err) {
    // FAIL CLOSED: If the revocation storage service is unavailable, do NOT assume the token is valid.
    console.error("[Session Security Alert] Revocation storage check failed. Failing closed for security.", err);
    return true; // Treat as revoked
  }
}

/**
 * Creates and signs a cryptographically secure JWT session token,
 * embeds a unique jti for distributed revocation tracking, and sets it as an HttpOnly, SameSite=Lax cookie.
 */
export async function createSession(userId: string, email: string): Promise<string> {
  const secretKey = getSecretKey();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const jti = crypto.randomUUID();

  const token = await new SignJWT({
    userId,
    email: email.toLowerCase().trim(),
    role: "admin",
    jti,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

/**
 * Verifies a JWT session token cryptographically.
 * Checks signature, expiration, and distributed shared revocation status.
 * Returns the decoded payload if valid, otherwise null.
 */
export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload || typeof payload.userId !== "string" || typeof payload.email !== "string") {
      return null;
    }

    const jti = typeof payload.jti === "string" ? payload.jti : undefined;

    // Check distributed revocation list (fails closed if storage down)
    if (jti) {
      const revoked = await isTokenRevoked(jti);
      if (revoked) {
        return null;
      }
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: (payload.role as "admin") || "admin",
      jti,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    // Token signature invalid, expired, or malformed
    return null;
  }
}

/**
 * Retrieves and validates the current session from incoming request cookies.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Invalidate session by revoking the token jti in persistent shared storage and deleting the cookie.
 */
export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      try {
        const secretKey = getSecretKey();
        const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
        if (payload?.jti && typeof payload.jti === "string") {
          const expDate = payload.exp ? new Date(payload.exp * 1000) : undefined;
          await revokeToken(payload.jti, payload.userId as string, expDate);
        }
      } catch {
        // Token was invalid, proceed with cookie deletion
      }
    }

    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Ignore error if cookies cannot be modified
  }
}

/**
 * SECURE requireAuth() implementation:
 *
 * 1. Reads the HTTP-only session cookie.
 * 2. Cryptographically verifies JWT signature and expiration.
 * 3. Verifies that the token has not been revoked in distributed storage.
 * 4. Verifies that the administrator user actually exists in the database.
 * 5. Returns { id, email } ONLY upon valid authentication.
 */
export async function requireAuth(): Promise<{ id: string; email: string } | null> {
  const session = await getSession();
  if (!session || !session.userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return null;
    }

    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}
