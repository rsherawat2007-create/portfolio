import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api";
import { checkContactRateLimit, recordContactSubmission } from "@/lib/rate-limit";

// Maximum allowable request payload size (15 KB)
const MAX_PAYLOAD_BYTES = 15 * 1024;

/**
 * Strips script tags and their inner content, style tags, all remaining HTML tags,
 * and control characters, leaving safe normalized plain text.
 */
function sanitizeInput(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>/g, "") // Strip any remaining HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Strip non-printable ASCII control characters
    .trim();
}

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must not exceed 100 characters.")
    .transform(sanitizeInput),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(120, "Email must not exceed 120 characters.")
    .toLowerCase(),
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters.")
    .max(150, "Subject must not exceed 150 characters.")
    .transform(sanitizeInput),
  message: z
    .string()
    .min(5, "Message must be at least 5 characters.")
    .max(3000, "Message must not exceed 3000 characters.")
    .transform(sanitizeInput),
  hp: z.string().optional(), // Honeypot trap field
});

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Public Contact Form Submission Endpoint:
 * Accepts recruiter and visitor messages with strict validation, rate limiting, spam honeypot,
 * and persistent storage via Prisma (ContactMessage model) without local filesystem writes.
 * Fully compatible with serverless read-only platforms (Vercel).
 */
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // 1. Distributed Rate Limiting Check (Max 5 submissions per 15 minutes per IP)
  const rateLimit = await checkContactRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many submissions. Please wait ${rateLimit.retryAfterSeconds} seconds before sending another message.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateLimit.retryAfterSeconds.toString(),
        },
      }
    );
  }

  // 2. Request Payload Size Validation
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return err("Message payload exceeds maximum permitted size (15KB).", 413);
  }

  try {
    const rawText = await req.text();
    if (rawText.length > MAX_PAYLOAD_BYTES) {
      return err("Message payload exceeds maximum permitted size (15KB).", 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch {
      return err("Invalid JSON payload.", 400);
    }

    // 3. Spam Honeypot Trap
    // Automated bots often populate all form fields. If honeypot is filled, discard silently.
    if (typeof body === "object" && body !== null && "hp" in body && typeof (body as any).hp === "string") {
      const hpVal = (body as any).hp.trim();
      if (hpVal.length > 0) {
        // Return 200 OK so the spam bot believes the message succeeded, without storing it
        return ok({
          received: true,
          message: "Thank you for reaching out! Your message has been received.",
        });
      }
    }

    // 4. Schema Validation & Sanitization
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] || "Validation failed";
      return err(firstError, 400);
    }

    const { name, email, subject, message } = parsed.data;

    // Record submission count for distributed rate limiting
    await recordContactSubmission(clientIp);

    // 5. Store message securely in persistent database (Prisma ContactMessage)
    // Serverless-ready: Never writes to local filesystem (compatible with Vercel's read-only runtime)
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        sourceIp: clientIp.startsWith("127.") ? "localhost" : "remote",
      },
    });

    return ok({
      received: true,
      message: "Thank you for reaching out! Your message has been received.",
    });
  } catch (e) {
    console.error("[Contact API Error]", e);
    return err("Unable to process your message at this time. Please try again later.", 500);
  }
}
