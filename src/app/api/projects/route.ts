import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const createSchema = z.object({
  name: z.string().min(1),
  summary: z.string().optional(),
  problemStatement: z.string().optional(),
  objectives: z.string().optional(),
  category: z.string().optional(),
  technologies: z.string().optional(),
  myContribution: z.string().optional(),
  teamMembers: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  completionDate: z.string().datetime().optional().nullable(),
  status: z.enum(["idea","planned","in_development","testing","completed","archived"]).default("idea"),
  githubUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  featuresImpl: z.string().optional(),
  featuresPlanned: z.string().optional(),
  testingResults: z.string().optional(),
  evalMethodology: z.string().optional(),
  measuredOutcomes: z.string().optional(),
  limitations: z.string().optional(),
  futureImprovements: z.string().optional(),
  associatedSkills: z.string().optional(),
  associatedEvent: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const projects = await prisma.project.findMany({
      where: { userId: auth.id },
      include: { milestones: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(projects);
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
    const project = await prisma.project.create({ data: { userId: auth.id, ...parsed.data } });
    try {
      revalidatePath("/");
    } catch {
      // ignore
    }
    return ok(project);
  } catch (e) {
    return serverError(e);
  }
}
