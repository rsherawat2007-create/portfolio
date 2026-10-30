import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  issuer: z.string().optional(),
  issueDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  credentialId: z.string().optional(),
  verificationUrl: z.string().optional(),
  skillsCovered: z.string().optional(),
  duration: z.string().optional(),
  status: z.enum(["planned","in_progress","completed","expired"]).optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
});

async function getOwned(id: string, userId: string) {
  return prisma.certificate.findFirst({ where: { id, userId } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const { id } = await params;
    const existing = await getOwned(id, auth.id);
    if (!existing) return notFound("Certificate");
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());
    const record = await prisma.certificate.update({ where: { id }, data: parsed.data });
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
    if (!existing) return notFound("Certificate");
    await prisma.certificate.delete({ where: { id } });
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
