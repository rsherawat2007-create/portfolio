import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  institution: z.string().min(1).optional(),
  qualification: z.string().optional(),
  department: z.string().optional(),
  specialization: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isExpected: z.boolean().optional(),
  status: z.enum(["planned", "in_progress", "completed", "discontinued"]).optional(),
  semester: z.string().optional(),
  gpa: z.string().optional(),
  subjects: z.string().optional(),
  academicProjects: z.string().optional(),
  awards: z.string().optional(),
  institutionUrl: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
});

async function getOwned(id: string, userId: string) {
  return prisma.education.findFirst({ where: { id, userId } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const record = await getOwned(id, auth.id);
    if (!record) return notFound("Education record");
    return ok(record);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const existing = await getOwned(id, auth.id);
    if (!existing) return notFound("Education record");

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const record = await prisma.education.update({ where: { id }, data: parsed.data });
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
    if (!existing) return notFound("Education record");
    await prisma.education.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
