/**
 * In-memory sliding window rate limiter for security-sensitive endpoints (e.g. login).
 * Tracks failed attempts per IP address to mitigate brute-force attacks.
 */

interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  // If no record exists or window expired, reset
  if (!record || now > record.resetAt) {
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.attempts),
    retryAfterSeconds: 0,
  };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, {
      attempts: 1,
      resetAt: now + WINDOW_MS,
    });
  } else {
    record.attempts += 1;
  }
}

export function resetLoginRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}
