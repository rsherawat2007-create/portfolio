import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const createSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().optional(),
  issueDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  credentialId: z.string().optional(),
  verificationUrl: z.string().url().optional().or(z.literal("")),
  skillsCovered: z.string().optional(),
  duration: z.string().optional(),
  status: z.enum(["planned","in_progress","completed","expired"]).default("planned"),
  isVerified: z.boolean().default(false),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const certificates = await prisma.certificate.findMany({
      where: { userId: auth.id },
      orderBy: { issueDate: "desc" },
    });
    return ok(certificates);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());
    const cert = await prisma.certificate.create({ data: { userId: auth.id, ...parsed.data } });
    try {
      revalidatePath("/");
    } catch {
      // ignore
    }
    return ok(cert);
  } catch (e) {
    return serverError(e);
  }
}
