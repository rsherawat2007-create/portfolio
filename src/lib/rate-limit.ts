/**
 * In-memory sliding window rate limiter for security-sensitive endpoints (login, contact).
 * Tracks attempts per IP address to mitigate brute-force and spam abuse.
 */

interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const contactSubmissions = new Map<string, RateLimitRecord>();

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const CONTACT_MAX_SUBMISSIONS = 5;
const CONTACT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    return {
      allowed: true,
      remainingAttempts: LOGIN_MAX_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  if (record.attempts >= LOGIN_MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, LOGIN_MAX_ATTEMPTS - record.attempts),
    retryAfterSeconds: 0,
  };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, {
      attempts: 1,
      resetAt: now + LOGIN_WINDOW_MS,
    });
  } else {
    record.attempts += 1;
  }
}

export function resetLoginRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

// ── Contact Submission Rate Limiting ──
export function checkContactRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const record = contactSubmissions.get(ip);

  if (!record || now > record.resetAt) {
    return {
      allowed: true,
      remainingAttempts: CONTACT_MAX_SUBMISSIONS,
      retryAfterSeconds: 0,
    };
  }

  if (record.attempts >= CONTACT_MAX_SUBMISSIONS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, CONTACT_MAX_SUBMISSIONS - record.attempts),
    retryAfterSeconds: 0,
  };
}

export function recordContactSubmission(ip: string): void {
  const now = Date.now();
  const record = contactSubmissions.get(ip);

  if (!record || now > record.resetAt) {
    contactSubmissions.set(ip, {
      attempts: 1,
      resetAt: now + CONTACT_WINDOW_MS,
    });
  } else {
    record.attempts += 1;
  }
}

export function resetContactRateLimit(ip: string): void {
  contactSubmissions.delete(ip);
}
