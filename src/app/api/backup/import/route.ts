import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const body = await req.json();
    if (!body || !body.data || body.exportVersion !== "1.0") {
      return err("Invalid backup format. Expected exportVersion 1.0 backup file.", 400);
    }

    const { data } = body;
    let importedSkillsCount = 0;
    let importedProjectsCount = 0;

    // Restore Skills without silent destructive overwrite
    if (Array.isArray(data.skills)) {
      for (const skill of data.skills) {
        if (skill.name && skill.category) {
          await prisma.skill.create({
            data: {
              userId: auth.id,
              name: skill.name,
              category: skill.category,
              description: skill.description || null,
              status: skill.status || "planned",
              notes: skill.notes || null,
            },
          });
          importedSkillsCount++;
        }
      }
    }

    // Restore Projects
    if (Array.isArray(data.projects)) {
      for (const p of data.projects) {
        if (p.name) {
          await prisma.project.create({
            data: {
              userId: auth.id,
              name: p.name,
              summary: p.summary || null,
              category: p.category || null,
              status: p.status || "idea",
              githubUrl: p.githubUrl || null,
              demoUrl: p.demoUrl || null,
            },
          });
          importedProjectsCount++;
        }
      }
    }

    return ok({
      message: "Data successfully restored",
      importedSkillsCount,
      importedProjectsCount,
    });
  } catch (e) {
    return serverError(e);
  }
}
