import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["planned", "learning", "practiced", "demonstrated"]).optional(),
  dateStarted: z.string().datetime().optional().nullable(),
  lastPracticed: z.string().datetime().optional().nullable(),
  resources: z.string().optional(),
  notes: z.string().optional(),
  nextMilestone: z.string().optional(),
  isPublic: z.boolean().optional(),
});

async function getOwnedSkill(skillId: string, userId: string) {
  return prisma.skill.findFirst({ where: { id: skillId, userId } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const skill = await getOwnedSkill(id, auth.id);
    if (!skill) return notFound("Skill");
    return ok(skill);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const existing = await getOwnedSkill(id, auth.id);
    if (!existing) return notFound("Skill");

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const skill = await prisma.skill.update({ where: { id }, data: parsed.data });
    try {
      revalidatePath("/");
    } catch {
      // ignore
    }
    return ok(skill);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const existing = await getOwnedSkill(id, auth.id);
    if (!existing) return notFound("Skill");
    await prisma.skill.delete({ where: { id } });
    try {
      revalidatePath("/");
    } catch {
      // ignore
    }
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
