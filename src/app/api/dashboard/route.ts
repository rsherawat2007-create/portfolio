import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized, serverError } from "@/lib/api";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const [skills, projects, labs, certs, hackathons, experiences, journalEntries] =
      await Promise.all([
        prisma.skill.findMany({ where: { userId: auth.id }, select: { id: true, status: true, category: true } }),
        prisma.project.findMany({ where: { userId: auth.id }, select: { id: true, status: true } }),
        prisma.lab.findMany({ where: { userId: auth.id }, select: { id: true, status: true } }),
        prisma.certificate.findMany({ where: { userId: auth.id }, select: { id: true, status: true, isVerified: true } }),
        prisma.hackathon.findMany({ where: { userId: auth.id }, select: { id: true, participationStatus: true } }),
        prisma.experience.findMany({ where: { userId: auth.id }, select: { id: true, type: true } }),
        prisma.journalEntry.findMany({ where: { userId: auth.id }, select: { id: true, date: true }, orderBy: { date: "desc" } }),
      ]);

    const skillsByStatus = skills.reduce((acc: Record<string, number>, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});

    const projectsByStatus = projects.reduce((acc: Record<string, number>, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const recentActivity = journalEntries.slice(0, 30).map((e) => ({
      date: e.date.toISOString().split("T")[0],
    }));

    return ok({
      skills: {
        total: skills.length,
        byStatus: skillsByStatus,
      },
      projects: {
        total: projects.length,
        byStatus: projectsByStatus,
        completed: projects.filter((p) => p.status === "completed").length,
      },
      labs: {
        total: labs.length,
        completed: labs.filter((l) => l.status === "completed" || l.status === "reviewed").length,
      },
      certificates: {
        total: certs.length,
        earned: certs.filter((c) => c.status === "completed").length,
        verified: certs.filter((c) => c.isVerified).length,
      },
      hackathons: {
        total: hackathons.length,
        participated: hackathons.filter((h) =>
          ["participated", "shortlisted", "finalist", "winner"].includes(h.participationStatus)
        ).length,
      },
      experience: {
        total: experiences.length,
      },
      journal: {
        total: journalEntries.length,
        recentActivity,
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
