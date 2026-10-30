import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { ok, err } from "@/lib/api";
import { checkContactRateLimit, recordContactSubmission } from "@/lib/rate-limit";

// Maximum allowable request payload size (15 KB)
const MAX_PAYLOAD_BYTES = 15 * 1024;

/**
 * Strips HTML tags, potential script/iframe tags, control characters, and normalizes whitespace.
 */
function sanitizeInput(str: string): string {
  return str
    .replace(/<[^>]*>/g, "") // Strip HTML tags
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
 * Accepts recruiter and visitor messages with strict validation, rate limiting, and spam protection.
 */
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // 1. Rate Limiting Check (Max 5 submissions per 15 minutes per IP)
  const rateLimit = checkContactRateLimit(clientIp);
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

    // Record submission count for rate limiting
    recordContactSubmission(clientIp);

    // 5. Store message securely in private data directory
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "messages.json");

    await fs.mkdir(dataDir, { recursive: true });

    let messages: any[] = [];
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      messages = JSON.parse(fileData);
      if (!Array.isArray(messages)) messages = [];
    } catch {
      messages = [];
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
      sourceIp: clientIp.startsWith("127.") ? "localhost" : "remote",
    };

    messages.push(newMessage);
    // Keep max 200 recent messages to prevent disk bloat
    if (messages.length > 200) {
      messages = messages.slice(-200);
    }

    await fs.writeFile(filePath, JSON.stringify(messages, null, 2), "utf-8");

    return ok({
      received: true,
      message: "Thank you for reaching out! Your message has been received.",
    });
  } catch (e) {
    console.error("[Contact API Error]", e);
    return err("Unable to process your message at this time. Please try again later.", 500);
  }
}
