import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  repository: z.string().min(1).optional(),
  organization: z.string().optional(),
  issueLinks: z.string().optional(),
  prLinks: z.string().optional(),
  description: z.string().optional(),
  technologies: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: z.enum(["proposed", "open", "merged", "rejected"]).optional(),
  reviewFeedback: z.string().optional(),
  lessonsLearned: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;

    const existing = await prisma.openSourceContribution.findFirst({ where: { id, userId: auth.id } });
    if (!existing) return notFound("Contribution");

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const updated = await prisma.openSourceContribution.update({
      where: { id },
      data: parsed.data,
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

    const existing = await prisma.openSourceContribution.findFirst({ where: { id, userId: auth.id } });
    if (!existing) return notFound("Contribution");

    await prisma.openSourceContribution.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
