import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  eventName: z.string().min(1).optional(),
  organizer: z.string().optional(),
  type: z.string().optional(),
  date: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().optional(),
  isOnline: z.boolean().optional(),
  registrationStatus: z.string().optional(),
  participationStatus: z.string().optional(),
  teamName: z.string().optional(),
  teamMembers: z.string().optional(),
  myRole: z.string().optional(),
  problemStatement: z.string().optional(),
  projectName: z.string().optional(),
  technologies: z.string().optional(),
  repositoryUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  result: z.string().optional(),
  rank: z.string().optional(),
  lessonsLearned: z.string().optional(),
  futureImprovements: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
});

async function getOwned(id: string, userId: string) {
  return prisma.hackathon.findFirst({ where: { id, userId } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const existing = await getOwned(id, auth.id);
    if (!existing) return notFound("Event");
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());
    const record = await prisma.hackathon.update({ where: { id }, data: parsed.data });
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
    if (!existing) return notFound("Event");
    await prisma.hackathon.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
