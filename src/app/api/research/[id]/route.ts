import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  authors: z.string().optional(),
  publication: z.string().optional(),
  url: z.string().optional(),
  doi: z.string().optional(),
  date: z.string().datetime().optional().nullable(),
  topic: z.string().optional(),
  summary: z.string().optional(),
  researchQuestions: z.string().optional(),
  methodology: z.string().optional(),
  findings: z.string().optional(),
  limitations: z.string().optional(),
  notes: z.string().optional(),
  relatedProjects: z.string().optional(),
  status: z.enum(["reading", "reproduced", "writing", "submitted", "published"]).optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;

    const existing = await prisma.researchPaper.findFirst({ where: { id, userId: auth.id } });
    if (!existing) return notFound("Paper");

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const updated = await prisma.researchPaper.update({
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

    const existing = await prisma.researchPaper.findFirst({ where: { id, userId: auth.id } });
    if (!existing) return notFound("Paper");

    await prisma.researchPaper.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
