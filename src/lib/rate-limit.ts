import { prisma } from "@/lib/prisma";

/**
 * Distributed Rate Limiting Engine:
 * Implements persistent rate limiting across multiple serverless/container instances.
 *
 * Architecture:
 * 1. Redis Support: If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set,
 *    uses Redis for sub-millisecond atomic key-expiry operations.
 * 2. Shared Database: Uses Prisma (PostgreSQL in production, SQLite in local dev)
 *    to store persistent rate-limit attempts in RateLimitRecord.
 * 3. In-Memory Safe Fallback: If shared storage is momentarily unreachable,
 *    gracefully degrades to local in-memory tracking without crashing the application.
 */

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const CONTACT_MAX_SUBMISSIONS = 5;
const CONTACT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// In-Memory Fallback Cache
interface FallbackRecord {
  attempts: number;
  resetAt: number;
}
const fallbackCache = new Map<string, FallbackRecord>();

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url: url.replace(/\/$/, ""), token };
  }
  return null;
}

// ── Shared Check & Record Logic ──

async function checkSharedRateLimit(
  prefix: string,
  identifier: string,
  maxAttempts: number,
  windowMs: number
): Promise<{ allowed: boolean; remainingAttempts: number; retryAfterSeconds: number }> {
  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  const windowStart = new Date(now - windowMs);

  // 1. Try Upstash Redis if configured
  const redis = getRedisConfig();
  if (redis) {
    try {
      const res = await fetch(`${redis.url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${redis.token}` },
      });
      const data = await res.json();
      const currentAttempts = data.result ? parseInt(data.result, 10) : 0;

      if (currentAttempts >= maxAttempts) {
        // Query TTL from Redis for accurate Retry-After
        const ttlRes = await fetch(`${redis.url}/ttl/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${redis.token}` },
        });
        const ttlData = await ttlRes.json();
        const retryAfterSeconds = Math.max(1, ttlData.result || Math.ceil(windowMs / 1000));

        return {
          allowed: false,
          remainingAttempts: 0,
          retryAfterSeconds,
        };
      }

      return {
        allowed: true,
        remainingAttempts: Math.max(0, maxAttempts - currentAttempts),
        retryAfterSeconds: 0,
      };
    } catch (err) {
      console.warn("[RateLimit Storage Warning] Redis check failed, falling back to database:", err);
    }
  }

  // 2. Try Shared Database via Prisma
  try {
    const count = await prisma.rateLimitRecord.count({
      where: {
        key,
        createdAt: { gte: windowStart },
      },
    });

    if (count >= maxAttempts) {
      const oldest = await prisma.rateLimitRecord.findFirst({
        where: {
          key,
          createdAt: { gte: windowStart },
        },
        orderBy: { createdAt: "asc" },
      });

      const oldestTime = oldest ? oldest.createdAt.getTime() : now - windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestTime + windowMs - now) / 1000));

      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
      };
    }

    return {
      allowed: true,
      remainingAttempts: Math.max(0, maxAttempts - count),
      retryAfterSeconds: 0,
    };
  } catch (err) {
    console.error("[RateLimit Database Warning] Database check failed, using in-memory fallback:", err);

    // 3. Fallback to In-Memory sliding cache
    const record = fallbackCache.get(key);
    if (!record || now > record.resetAt) {
      return { allowed: true, remainingAttempts: maxAttempts, retryAfterSeconds: 0 };
    }
    if (record.attempts >= maxAttempts) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
    }
    return {
      allowed: true,
      remainingAttempts: Math.max(0, maxAttempts - record.attempts),
      retryAfterSeconds: 0,
    };
  }
}

async function recordSharedAttempt(
  prefix: string,
  identifier: string,
  windowMs: number
): Promise<void> {
  const key = `${prefix}:${identifier}`;
  const now = Date.now();

  // 1. Try Redis
  const redis = getRedisConfig();
  if (redis) {
    try {
      const windowSeconds = Math.ceil(windowMs / 1000);
      // Pipeline: INCR key, then EXPIRE key windowSeconds if new
      await fetch(`${redis.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redis.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, windowSeconds],
        ]),
      });
      return;
    } catch (err) {
      console.warn("[RateLimit Storage Warning] Redis record failed, recording to database:", err);
    }
  }

  // 2. Try Shared Database
  try {
    await prisma.rateLimitRecord.create({
      data: { key },
    });

    // Opportunistically prune records older than 2 hours to prevent table growth
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);
    prisma.rateLimitRecord
      .deleteMany({
        where: { createdAt: { lt: twoHoursAgo } },
      })
      .catch(() => {});
  } catch (err) {
    console.error("[RateLimit Database Error] Could not write attempt to DB, recording in memory:", err);
    // In-memory fallback recording
    const record = fallbackCache.get(key);
    if (!record || now > record.resetAt) {
      fallbackCache.set(key, { attempts: 1, resetAt: now + windowMs });
    } else {
      record.attempts += 1;
    }
  }
}

async function resetSharedLimit(prefix: string, identifier: string): Promise<void> {
  const key = `${prefix}:${identifier}`;

  const redis = getRedisConfig();
  if (redis) {
    try {
      await fetch(`${redis.url}/del/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${redis.token}` },
      });
    } catch {
      // ignore
    }
  }

  try {
    await prisma.rateLimitRecord.deleteMany({
      where: { key },
    });
  } catch {
    // ignore
  }

  fallbackCache.delete(key);
}

// ── Public Exported Interfaces ──

export async function checkLoginRateLimit(ip: string) {
  return checkSharedRateLimit("login", ip, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
}

export async function recordFailedLogin(ip: string) {
  return recordSharedAttempt("login", ip, LOGIN_WINDOW_MS);
}

export async function resetLoginRateLimit(ip: string) {
  return resetSharedLimit("login", ip);
}

export async function checkContactRateLimit(ip: string) {
  return checkSharedRateLimit("contact", ip, CONTACT_MAX_SUBMISSIONS, CONTACT_WINDOW_MS);
}

export async function recordContactSubmission(ip: string) {
  return recordSharedAttempt("contact", ip, CONTACT_WINDOW_MS);
}

export async function resetContactRateLimit(ip: string) {
  return resetSharedLimit("contact", ip);
}
