import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const reviewSchema = z.object({
  weekStart: z.string().datetime(),
  weekEnd: z.string().datetime(),
  tasksCompleted: z.string().optional(),
  tasksCarried: z.string().optional(),
  skillsPracticed: z.string().optional(),
  projectsAdvanced: z.string().optional(),
  labsCompleted: z.string().optional(),
  journalEntries: z.number().int().default(0),
  problemsSolved: z.number().int().default(0),
  gapsIdentified: z.string().optional(),
  goalsAchieved: z.string().optional(),
  wentWell: z.string().optional(),
  difficult: z.string().optional(),
  learned: z.string().optional(),
  toChange: z.string().optional(),
  nextPriority: z.string().optional(),
  priorities: z.string().optional(),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const reviews = await prisma.weeklyReview.findMany({
      where: { userId: auth.id },
      orderBy: { weekStart: "desc" },
    });

    return ok(reviews);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const review = await prisma.weeklyReview.create({
      data: {
        userId: auth.id,
        ...parsed.data,
        weekStart: new Date(parsed.data.weekStart),
        weekEnd: new Date(parsed.data.weekEnd),
      },
    });

    return ok(review);
  } catch (e) {
    return serverError(e);
  }
}
