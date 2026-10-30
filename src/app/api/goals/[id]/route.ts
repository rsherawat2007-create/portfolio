import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  targetDate: z.string().datetime().optional().nullable(),
  status: z.enum(["active", "completed", "paused", "cancelled"]).optional(),
  completedAt: z.string().datetime().optional().nullable(),
  milestones: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;

    const existing = await prisma.goal.findFirst({ where: { id, userId: auth.id } });
    if (!existing) return notFound("Goal");

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.targetDate !== undefined) {
      updateData.targetDate = parsed.data.targetDate ? new Date(parsed.data.targetDate) : null;
    }
    if (parsed.data.status === "completed" && !existing.completedAt) {
      updateData.completedAt = parsed.data.completedAt ? new Date(parsed.data.completedAt) : new Date();
    } else if (parsed.data.status && parsed.data.status !== "completed") {
      updateData.completedAt = null;
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return ok(updated);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;

    const existing = await prisma.goal.findFirst({ where: { id, userId: auth.id } });
    if (!existing) return notFound("Goal");

    await prisma.goal.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
