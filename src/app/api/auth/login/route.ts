import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // 1. Rate Limiting Check
  const rateLimit = await checkLoginRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many failed login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateLimit.retryAfterSeconds.toString(),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password format.",
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Fetch User by Email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 3. Timing-Safe Password Check (prevent user enumeration)
    // If user not found, perform dummy bcrypt check to prevent timing attacks
    const dummyHash = "$2a$12$e8Y6lP6OaWlQ0bYk6d9lTuw7x8h2e.1l9x6u5v4w3t2s1r0q9p8o7";
    const passwordHashToCompare = user ? user.password : dummyHash;
    const isPasswordValid = await bcrypt.compare(password, passwordHashToCompare);

    if (!user || !isPasswordValid) {
      await recordFailedLogin(clientIp);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // 4. Reset rate limit upon successful login
    await resetLoginRateLimit(clientIp);

    // 5. Create secure session cookie
    await createSession(user.id, user.email);

    return NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[Login Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during authentication.",
      },
      { status: 500 }
    );
  }
}
