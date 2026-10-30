import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const osSchema = z.object({
  repository: z.string().min(1, "Repository is required"),
  organization: z.string().optional(),
  issueLinks: z.string().optional(),
  prLinks: z.string().optional(),
  description: z.string().optional(),
  technologies: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: z.enum(["proposed", "open", "merged", "rejected"]).default("proposed"),
  reviewFeedback: z.string().optional(),
  lessonsLearned: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const items = await prisma.openSourceContribution.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: "desc" },
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
    const parsed = osSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const item = await prisma.openSourceContribution.create({
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
