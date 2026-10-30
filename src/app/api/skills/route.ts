import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const createSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  status: z.enum(["planned", "learning", "practiced", "demonstrated"]).default("planned"),
  dateStarted: z.string().datetime().optional().nullable(),
  resources: z.string().optional(),
  notes: z.string().optional(),
  nextMilestone: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const skills = await prisma.skill.findMany({
      where: { userId: auth.id },
      include: { evidence: { select: { id: true, title: true, type: true } } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return ok(skills);
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
    if (!parsed.success) {
      return err("Validation failed", 400, parsed.error.flatten());
    }

    const skill = await prisma.skill.create({
      data: { userId: auth.id, ...parsed.data },
    });

    try {
      revalidatePath("/");
    } catch {
      // ignore
    }

    return ok(skill);
  } catch (e) {
    return serverError(e);
  }
}
