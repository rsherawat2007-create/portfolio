import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
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

// ── Server-Side Token Revocation Registry ──
const revokedTokens = new Map<string, number>(); // jti -> revokedAt timestamp

const REVOCATION_FILE = path.join(process.cwd(), "data", "revoked_tokens.json");

function loadRevokedTokens(): void {
  try {
    if (fs.existsSync(REVOCATION_FILE)) {
      const data = JSON.parse(fs.readFileSync(REVOCATION_FILE, "utf-8"));
      const now = Date.now();
      for (const [jti, timestamp] of Object.entries(data)) {
        // Only load tokens revoked within the last 7 days (older ones naturally expire)
        if (typeof timestamp === "number" && now - timestamp < SESSION_DURATION) {
          revokedTokens.set(jti, timestamp);
        }
      }
    }
  } catch {
    // Ignore read errors
  }
}

function persistRevokedTokens(): void {
  try {
    const dataDir = path.dirname(REVOCATION_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const obj = Object.fromEntries(revokedTokens.entries());
    fs.writeFileSync(REVOCATION_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch {
    // Ignore write errors
  }
}

// Initialize on module load
loadRevokedTokens();

export function revokeToken(jti?: string): void {
  if (!jti) return;
  revokedTokens.set(jti, Date.now());
  persistRevokedTokens();
}

export function isTokenRevoked(jti?: string): boolean {
  if (!jti) return false;
  return revokedTokens.has(jti);
}

/**
 * Creates and signs a cryptographically secure JWT session token,
 * embeds a unique jti for revocation tracking, and sets it as an HttpOnly, SameSite=Lax cookie.
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
 * Checks signature, expiration, and server-side revocation status.
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

    // Check server-side revocation list
    if (jti && isTokenRevoked(jti)) {
      return null;
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
 * Invalidate session by revoking the token jti and deleting the cookie.
 */
export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const payload = await verifySessionToken(token);
      if (payload?.jti) {
        revokeToken(payload.jti);
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
 * 3. Verifies that the token has not been revoked server-side.
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
