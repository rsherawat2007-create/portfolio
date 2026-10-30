import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const createSchema = z.object({
  title: z.string().min(1),
  platform: z.string().optional(),
  topic: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["beginner","intermediate","advanced"]).optional(),
  startDate: z.string().datetime().optional().nullable(),
  completionDate: z.string().datetime().optional().nullable(),
  status: z.enum(["planned","in_progress","completed","reviewed"]).default("planned"),
  objectives: z.string().optional(),
  toolsUsed: z.string().optional(),
  conceptsLearned: z.string().optional(),
  notes: z.string().optional(),
  findings: z.string().optional(),
  remediation: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  relatedSkills: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const labs = await prisma.lab.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: "desc" },
    });
    return ok(labs);
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
    const lab = await prisma.lab.create({ data: { userId: auth.id, ...parsed.data } });
    return ok(lab);
  } catch (e) {
    return serverError(e);
  }
}
