import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;

    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId: auth.id },
      include: { items: { orderBy: { order: "asc" } } },
    });
    if (!roadmap) return notFound("Roadmap");

    return ok(roadmap);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;

    const existing = await prisma.roadmap.findFirst({ where: { id, userId: auth.id } });
    if (!existing) return notFound("Roadmap");

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const updated = await prisma.roadmap.update({
      where: { id },
      data: parsed.data,
      include: { items: true },
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

    const existing = await prisma.roadmap.findFirst({ where: { id, userId: auth.id } });
    if (!existing) return notFound("Roadmap");

    await prisma.roadmap.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
