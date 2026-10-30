import { prisma } from "@/lib/prisma";
import { ok, serverError } from "@/lib/api";

export async function GET() {
  try {
    // Return published records for the profile user
    const user = await prisma.user.findFirst({
      include: {
        profile: true,
        userSettings: true,
      },
    });

    if (!user) {
      return ok({ profile: null, isConfigured: false });
    }

    const [
      education,
      skills,
      projects,
      certificates,
      experiences,
      hackathons,
      extracurriculars,
      researchPapers,
      openSourceContribs,
      articles,
    ] = await Promise.all([
      prisma.education.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { startDate: "desc" },
      }),
      prisma.skill.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.project.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.certificate.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { issueDate: "desc" },
      }),
      prisma.experience.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { startDate: "desc" },
      }),
      prisma.hackathon.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { date: "desc" },
      }),
      prisma.extracurricularActivity.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { startDate: "desc" },
      }),
      prisma.researchPaper.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { date: "desc" },
      }),
      prisma.openSourceContribution.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.journalEntry.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { date: "desc" },
      }),
    ]);

    return ok({
      isConfigured: true,
      profile: user.profile,
      education,
      skills,
      projects,
      certificates,
      experiences,
      hackathons,
      extracurriculars,
      researchPapers,
      openSourceContribs,
      articles,
    });
  } catch (e) {
    return serverError(e);
  }
}
