import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  phase: z.string().optional(),
  prerequisites: z.string().optional(),
  resources: z.string().optional(),
  exercises: z.string().optional(),
  completionCriteria: z.string().optional(),
  targetDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional(),
  status: z.enum(["planned", "in_progress", "completed", "skipped"]).optional(),
  order: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id, itemId } = await params;

    const roadmap = await prisma.roadmap.findFirst({ where: { id, userId: auth.id } });
    if (!roadmap) return notFound("Roadmap");

    const existingItem = await prisma.roadmapItem.findFirst({
      where: { id: itemId, roadmapId: id },
    });
    if (!existingItem) return notFound("Roadmap item");

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const updated = await prisma.roadmapItem.update({
      where: { id: itemId },
      data: parsed.data,
    });

    return ok(updated);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id, itemId } = await params;

    const roadmap = await prisma.roadmap.findFirst({ where: { id, userId: auth.id } });
    if (!roadmap) return notFound("Roadmap");

    const existingItem = await prisma.roadmapItem.findFirst({
      where: { id: itemId, roadmapId: id },
    });
    if (!existingItem) return notFound("Roadmap item");

    await prisma.roadmapItem.delete({ where: { id: itemId } });
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
