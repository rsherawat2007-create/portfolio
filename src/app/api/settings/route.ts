import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const settingsSchema = z.object({
  theme: z.enum(["dark", "light"]).optional(),
  timezone: z.string().optional(),
  xpEnabled: z.boolean().optional(),
  badgesEnabled: z.boolean().optional(),
  streaksEnabled: z.boolean().optional(),
  aiEnabled: z.boolean().optional(),
  geminiApiKey: z.string().optional().nullable(),
  profilePublic: z.boolean().optional(),
  publicUsername: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    let settings = await prisma.userSettings.findUnique({
      where: { userId: auth.id },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: auth.id },
      });
    }

    return ok({
      ...settings,
      geminiApiKey: settings.geminiApiKey ? "••••••••••••••••" : "", // Mask sensitive key
      hasGeminiApiKey: Boolean(settings.geminiApiKey),
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const updateData: Record<string, unknown> = { ...parsed.data };
    // If empty string for key or masked placeholder sent back, do not overwrite with masked string
    if (updateData.geminiApiKey === "••••••••••••••••") {
      delete updateData.geminiApiKey;
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: auth.id },
      update: updateData,
      create: { userId: auth.id, ...updateData },
    });

    return ok({
      ...settings,
      geminiApiKey: settings.geminiApiKey ? "••••••••••••••••" : "",
      hasGeminiApiKey: Boolean(settings.geminiApiKey),
    });
  } catch (e) {
    return serverError(e);
  }
}
