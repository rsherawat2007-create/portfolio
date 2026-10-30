import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const createSchema = z.object({
  organization: z.string().min(1),
  role: z.string().min(1),
  type: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isCurrent: z.boolean().default(false),
  responsibilities: z.string().optional(),
  tasksCompleted: z.string().optional(),
  technologies: z.string().optional(),
  skillsDemonstrated: z.string().optional(),
  deliverables: z.string().optional(),
  outcomes: z.string().optional(),
  supervisor: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const experiences = await prisma.experience.findMany({
      where: { userId: auth.id },
      orderBy: { startDate: "desc" },
    });
    return ok(experiences);
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
    const exp = await prisma.experience.create({ data: { userId: auth.id, ...parsed.data } });
    return ok(exp);
  } catch (e) {
    return serverError(e);
  }
}
