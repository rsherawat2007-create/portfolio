import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  phase: z.string().optional(),
  prerequisites: z.string().optional(),
  resources: z.string().optional(),
  exercises: z.string().optional(),
  completionCriteria: z.string().optional(),
  targetDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional(),
  status: z.enum(["planned", "in_progress", "completed", "skipped"]).default("planned"),
  order: z.number().int().default(0),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;

    const roadmap = await prisma.roadmap.findFirst({ where: { id, userId: auth.id } });
    if (!roadmap) return notFound("Roadmap");

    const body = await req.json();
    const parsed = itemSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const item = await prisma.roadmapItem.create({
      data: {
        roadmapId: id,
        ...parsed.data,
      },
    });

    return ok(item);
  } catch (e) {
    return serverError(e);
  }
}
