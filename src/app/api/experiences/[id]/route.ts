import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  organization: z.string().min(1).optional(),
  role: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isCurrent: z.boolean().optional(),
  responsibilities: z.string().optional(),
  tasksCompleted: z.string().optional(),
  technologies: z.string().optional(),
  skillsDemonstrated: z.string().optional(),
  deliverables: z.string().optional(),
  outcomes: z.string().optional(),
  supervisor: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
});

async function getOwned(id: string, userId: string) {
  return prisma.experience.findFirst({ where: { id, userId } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const existing = await getOwned(id, auth.id);
    if (!existing) return notFound("Experience");
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());
    const record = await prisma.experience.update({ where: { id }, data: parsed.data });
    return ok(record);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const existing = await getOwned(id, auth.id);
    if (!existing) return notFound("Experience");
    await prisma.experience.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
