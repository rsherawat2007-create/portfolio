import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, unauthorized, serverError } from "@/lib/api";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const [
      profile,
      education,
      skills,
      projects,
      labs,
      experiments,
      certificates,
      experiences,
      hackathons,
      extracurriculars,
      researchPapers,
      openSourceContribs,
      roadmaps,
      journalEntries,
      goals,
      weeklyReviews,
      mistakes,
      integratedProjects,
    ] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: auth.id } }),
      prisma.education.findMany({ where: { userId: auth.id } }),
      prisma.skill.findMany({ where: { userId: auth.id } }),
      prisma.project.findMany({ where: { userId: auth.id }, include: { milestones: true } }),
      prisma.lab.findMany({ where: { userId: auth.id } }),
      prisma.experiment.findMany({ where: { userId: auth.id } }),
      prisma.certificate.findMany({ where: { userId: auth.id } }),
      prisma.experience.findMany({ where: { userId: auth.id } }),
      prisma.hackathon.findMany({ where: { userId: auth.id } }),
      prisma.extracurricularActivity.findMany({ where: { userId: auth.id } }),
      prisma.researchPaper.findMany({ where: { userId: auth.id } }),
      prisma.openSourceContribution.findMany({ where: { userId: auth.id } }),
      prisma.roadmap.findMany({ where: { userId: auth.id }, include: { items: true } }),
      prisma.journalEntry.findMany({ where: { userId: auth.id } }),
      prisma.goal.findMany({ where: { userId: auth.id } }),
      prisma.weeklyReview.findMany({ where: { userId: auth.id } }),
      prisma.mistakeJournal.findMany({ where: { userId: auth.id } }),
      prisma.integratedProject.findMany({ where: { userId: auth.id } }),
    ]);

    const backup = {
      exportVersion: "1.0",
      exportedAt: new Date().toISOString(),
      user: { id: auth.id, email: auth.email },
      data: {
        profile,
        education,
        skills,
        projects,
        labs,
        experiments,
        certificates,
        experiences,
        hackathons,
        extracurriculars,
        researchPapers,
        openSourceContribs,
        roadmaps,
        journalEntries,
        goals,
        weeklyReviews,
        mistakes,
        integratedProjects,
      },
    };

    return ok(backup);
  } catch (e) {
    return serverError(e);
  }
}
