import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const createSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  qualification: z.string().min(1, "Qualification is required"),
  department: z.string().optional(),
  specialization: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isExpected: z.boolean().default(true),
  status: z.enum(["planned", "in_progress", "completed", "discontinued"]).default("in_progress"),
  semester: z.string().optional(),
  gpa: z.string().optional(),
  subjects: z.string().optional(),
  academicProjects: z.string().optional(),
  awards: z.string().optional(),
  institutionUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const education = await prisma.education.findMany({
      where: { userId: auth.id },
      orderBy: { startDate: "desc" },
    });

    return ok(education);
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

    const education = await prisma.education.create({
      data: { userId: auth.id, ...parsed.data },
    });

    return ok(education);
  } catch (e) {
    return serverError(e);
  }
}
