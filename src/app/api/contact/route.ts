import { NextRequest } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { ok, err, serverError } from "@/lib/api";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(2, "Subject must be at least 2 characters."),
  message: z.string().min(5, "Message must be at least 5 characters."),
  hp: z.string().optional(), // Honeypot field for bot spam protection
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Spam Bot Protection: Check if honeypot is filled
    if (body.hp && body.hp.trim().length > 0) {
      return ok({
        received: true,
        message: "Your message has been processed.",
      });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] || "Validation failed";
      return err(firstError, 400);
    }

    const { name, email, subject, message } = parsed.data;

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "messages.json");

    await fs.mkdir(dataDir, { recursive: true });

    let messages: any[] = [];
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      messages = JSON.parse(fileData);
    } catch {
      messages = [];
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    await fs.writeFile(filePath, JSON.stringify(messages, null, 2), "utf-8");

    return ok({
      received: true,
      message: "Thank you for reaching out! Your message has been received.",
    });
  } catch (e) {
    return serverError(e);
  }
}
