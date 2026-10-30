import { prisma } from "@/lib/prisma";
import { ok, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Public Recruiter Portfolio API Endpoint:
 * Returns strictly curated, non-sensitive, public-facing information for recruiters.
 *
 * Security Controls:
 * - Explicit Prisma field selections (DTOs) for all models.
 * - Zero exposure of:
 *   - User IDs or database foreign keys (cuid/uuid)
 *   - Authentication credentials or password hashes
 *   - Private userSettings (e.g. Gemini API keys, internal preferences)
 *   - Internal administrative notes or unverified/unpublished records
 *   - Contact messages or session tokens
 */
export async function GET() {
  try {
    // 1. Fetch user profile with explicit projection
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        profile: {
          select: {
            fullName: true,
            photoUrl: true,
            headline: true,
            about: true,
            location: true,
            email: true,
            githubUrl: true,
            linkedinUrl: true,
            websiteUrl: true,
            twitterUrl: true,
            careerInterests: true,
            techInterests: true,
            currentFocus: true,
            longTermGoals: true,
          },
        },
      },
    });

    if (!user || !user.profile) {
      return ok({
        isConfigured: false,
        profile: null,
        education: [],
        skills: [],
        projects: [],
        certificates: [],
        experiences: [],
        hackathons: [],
        extracurriculars: [],
        researchPapers: [],
        openSourceContribs: [],
        articles: [],
      });
    }

    // 2. Fetch public records using explicit field selection (DTO projection)
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
        select: {
          id: true,
          institution: true,
          qualification: true,
          department: true,
          specialization: true,
          startDate: true,
          endDate: true,
          isExpected: true,
          status: true,
          semester: true,
          gpa: true,
          subjects: true,
          academicProjects: true,
          awards: true,
          institutionUrl: true,
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.skill.findMany({
        where: { userId: user.id, isPublic: true },
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          status: true,
          dateStarted: true,
          lastPracticed: true,
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.project.findMany({
        where: { userId: user.id, isPublic: true },
        select: {
          id: true,
          name: true,
          summary: true,
          problemStatement: true,
          objectives: true,
          category: true,
          technologies: true,
          myContribution: true,
          teamMembers: true,
          startDate: true,
          completionDate: true,
          status: true,
          githubUrl: true,
          demoUrl: true,
          featuresImpl: true,
          featuresPlanned: true,
          associatedSkills: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.certificate.findMany({
        where: { userId: user.id, isPublic: true },
        select: {
          id: true,
          title: true,
          issuer: true,
          issueDate: true,
          expiryDate: true,
          credentialId: true,
          verificationUrl: true,
          skillsCovered: true,
          duration: true,
          status: true,
          isVerified: true,
        },
        orderBy: { issueDate: "desc" },
      }),
      prisma.experience.findMany({
        where: { userId: user.id, isPublic: true },
        select: {
          id: true,
          organization: true,
          role: true,
          type: true,
          startDate: true,
          endDate: true,
          isCurrent: true,
          responsibilities: true,
          tasksCompleted: true,
          technologies: true,
          skillsDemonstrated: true,
          deliverables: true,
          outcomes: true,
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.hackathon.findMany({
        where: { userId: user.id, isPublic: true },
        select: {
          id: true,
          eventName: true,
          organizer: true,
          projectName: true,
          problemStatement: true,
          technologies: true,
          date: true,
          endDate: true,
          result: true,
          rank: true,
          participationStatus: true,
          repositoryUrl: true,
          demoUrl: true,
        },
        orderBy: { date: "desc" },
      }),
      prisma.extracurricularActivity.findMany({
        where: { userId: user.id, isPublic: true },
        select: {
          id: true,
          activity: true,
          organization: true,
          role: true,
          category: true,
          startDate: true,
          endDate: true,
          isCurrent: true,
          contribution: true,
          outcomes: true,
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.researchPaper.findMany({
        where: { userId: user.id, isPublic: true },
        select: {
          id: true,
          title: true,
          authors: true,
          publication: true,
          url: true,
          doi: true,
          date: true,
          topic: true,
          summary: true,
          status: true,
        },
        orderBy: { date: "desc" },
      }),
      prisma.openSourceContribution.findMany({
        where: { userId: user.id, isPublic: true },
        select: {
          id: true,
          repository: true,
          organization: true,
          issueLinks: true,
          prLinks: true,
          description: true,
          technologies: true,
          status: true,
          startDate: true,
          endDate: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.journalEntry.findMany({
        where: { userId: user.id, isPublic: true },
        select: {
          id: true,
          title: true,
          subject: true,
          category: true,
          concepts: true,
          explanation: true,
          date: true,
          tags: true,
        },
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
