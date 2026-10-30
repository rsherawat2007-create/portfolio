import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const paperSchema = z.object({
  title: z.string().min(1, "Paper title is required"),
  authors: z.string().optional(),
  publication: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  doi: z.string().optional(),
  date: z.string().datetime().optional().nullable(),
  topic: z.string().optional(),
  summary: z.string().optional(),
  researchQuestions: z.string().optional(),
  methodology: z.string().optional(),
  findings: z.string().optional(),
  limitations: z.string().optional(),
  notes: z.string().optional(),
  relatedProjects: z.string().optional(),
  status: z.enum(["reading", "reproduced", "writing", "submitted", "published"]).default("reading"),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const papers = await prisma.researchPaper.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: "desc" },
    });

    return ok(papers);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const body = await req.json();
    const parsed = paperSchema.safeParse(body);
    if (!parsed.success) return err("Validation failed", 400, parsed.error.flatten());

    const paper = await prisma.researchPaper.create({
      data: {
        userId: auth.id,
        ...parsed.data,
      },
    });

    return ok(paper);
  } catch (e) {
    return serverError(e);
  }
}
