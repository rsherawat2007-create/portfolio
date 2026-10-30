import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const createSchema = z.object({
  eventName: z.string().min(1),
  organizer: z.string().optional(),
  type: z.string().optional(),
  date: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().optional(),
  isOnline: z.boolean().default(false),
  registrationStatus: z.string().optional(),
  participationStatus: z.string().default("registered"),
  teamName: z.string().optional(),
  teamMembers: z.string().optional(),
  myRole: z.string().optional(),
  problemStatement: z.string().optional(),
  projectName: z.string().optional(),
  technologies: z.string().optional(),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  result: z.string().optional(),
  rank: z.string().optional(),
  lessonsLearned: z.string().optional(),
  futureImprovements: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();
    const hackathons = await prisma.hackathon.findMany({
      where: { userId: auth.id },
      orderBy: { date: "desc" },
    });
    return ok(hackathons);
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
    const h = await prisma.hackathon.create({ data: { userId: auth.id, ...parsed.data } });
    return ok(h);
  } catch (e) {
    return serverError(e);
  }
}
