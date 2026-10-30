import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  summary: z.string().optional(),
  problemStatement: z.string().optional(),
  objectives: z.string().optional(),
  category: z.string().optional(),
  technologies: z.string().optional(),
  myContribution: z.string().optional(),
  teamMembers: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  completionDate: z.string().datetime().optional().nullable(),
  status: z.enum(["idea","planned","in_development","testing","completed","archived"]).optional(),
  githubUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  featuresImpl: z.string().optional(),
  featuresPlanned: z.string().optional(),
  testingResults: z.string().optional(),
  evalMethodology: z.string().optional(),
  measuredOutcomes: z.string().optional(),
  limitations: z.string().optional(),
  futureImprovements: z.string().optional(),
  associatedSkills: z.string().optional(),
  associatedEvent: z.string().optional(),
  isPublic: z.boolean().optional(),
});

async function getOwned(id: string, userId: string) {
  return prisma.project.findFirst({ where: { id, userId } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const record = await prisma.project.findFirst({
      where: { id, userId: auth.id },
      include: { milestones: true },
    });
    if (!record) return notFound("Project");
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
    if (!existing) return notFound("Project");
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());
    const record = await prisma.project.update({ where: { id }, data: parsed.data });
    try {
      revalidatePath("/");
    } catch {
      // ignore
    }
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
    if (!existing) return notFound("Project");
    await prisma.project.delete({ where: { id } });
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
