import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "portfolio_admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    // In development or if not set, fallback to a deterministic 32+ char key
    const fallback = "dev-secret-key-for-portfolio-auth-32-chars-long!";
    return new TextEncoder().encode(fallback);
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

/**
 * Creates and signs a cryptographically secure JWT session token,
 * and sets it as an HttpOnly, SameSite=Lax cookie.
 */
export async function createSession(userId: string, email: string): Promise<string> {
  const secretKey = getSecretKey();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const token = await new SignJWT({
    userId,
    email: email.toLowerCase().trim(),
    role: "admin",
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
 * Returns the decoded payload if valid and unexpired, otherwise null.
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

    return {
      userId: payload.userId,
      email: payload.email,
      role: (payload.role as "admin") || "admin",
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
 * Invalidate session by deleting the session cookie.
 */
export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
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
 * 2. Cryptographically verifies the JWT signature and expiration.
 * 3. Verifies that the administrator user actually exists in the database.
 * 4. Returns { id, email } ONLY upon valid authentication.
 *
 * NEVER returns a default user or bypasses authentication.
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
