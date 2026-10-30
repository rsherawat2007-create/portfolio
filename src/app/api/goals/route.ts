import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const goalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  targetDate: z.string().datetime().optional().nullable(),
  status: z.enum(["active", "completed", "paused", "cancelled"]).default("active"),
  completedAt: z.string().datetime().optional().nullable(),
  milestones: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const [goals, achievements] = await Promise.all([
      prisma.goal.findMany({
        where: { userId: auth.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.achievement.findMany({
        where: { userId: auth.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return ok({ goals, achievements });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const body = await req.json();
    const parsed = goalSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const goal = await prisma.goal.create({
      data: {
        userId: auth.id,
        ...parsed.data,
        targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
        completedAt:
          parsed.data.status === "completed"
            ? parsed.data.completedAt
              ? new Date(parsed.data.completedAt)
              : new Date()
            : null,
      },
    });

    return ok(goal);
  } catch (e) {
    return serverError(e);
  }
}
