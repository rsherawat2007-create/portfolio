import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  platform: z.string().optional(),
  topic: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["beginner","intermediate","advanced"]).optional(),
  startDate: z.string().datetime().optional().nullable(),
  completionDate: z.string().datetime().optional().nullable(),
  status: z.enum(["planned","in_progress","completed","reviewed"]).optional(),
  objectives: z.string().optional(),
  toolsUsed: z.string().optional(),
  conceptsLearned: z.string().optional(),
  notes: z.string().optional(),
  findings: z.string().optional(),
  remediation: z.string().optional(),
  sourceUrl: z.string().optional(),
  relatedSkills: z.string().optional(),
  isPublic: z.boolean().optional(),
});

async function getOwned(id: string, userId: string) {
  return prisma.lab.findFirst({ where: { id, userId } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const existing = await getOwned(id, auth.id);
    if (!existing) return notFound("Lab");
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());
    const record = await prisma.lab.update({ where: { id }, data: parsed.data });
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
    if (!existing) return notFound("Lab");
    await prisma.lab.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
