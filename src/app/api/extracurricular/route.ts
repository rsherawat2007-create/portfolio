import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const extraSchema = z.object({
  activity: z.string().min(1, "Activity name is required"),
  organization: z.string().optional(),
  role: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isCurrent: z.boolean().default(false),
  contribution: z.string().optional(),
  outcomes: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const items = await prisma.extracurricularActivity.findMany({
      where: { userId: auth.id },
      orderBy: { startDate: "desc" },
    });

    return ok(items);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const body = await req.json();
    const parsed = extraSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const item = await prisma.extracurricularActivity.create({
      data: {
        userId: auth.id,
        ...parsed.data,
      },
    });

    return ok(item);
  } catch (e) {
    return serverError(e);
  }
}
