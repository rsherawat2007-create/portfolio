import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  isPublic: z.boolean().default(false),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: auth.id },
      include: { items: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return ok(roadmaps);
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

    const roadmap = await prisma.roadmap.create({
      data: { userId: auth.id, ...parsed.data },
      include: { items: true },
    });

    return ok(roadmap);
  } catch (e) {
    return serverError(e);
  }
}
