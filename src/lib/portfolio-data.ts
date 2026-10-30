import { prisma } from "@/lib/prisma";

export interface PublicProfileDTO {
  fullName: string;
  headline: string;
  about: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  photoUrl: string;
  techInterests: string;
}

export interface PublicProjectDTO {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  problemStatement: string;
  solution: string;
  technologies: string[];
  status: "Completed" | "In Active Development" | "Prototype";
  githubUrl?: string | null;
  demoUrl?: string | null;
  coreFeatures: string[];
  architectureDetails: string[];
  technicalHighlights: string[];
  isPublic: boolean;
}

export interface PublicCertificateDTO {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId?: string | null;
  verificationUrl?: string | null;
  pdfUrl?: string | null;
  imageUrl?: string | null;
  score?: string | null;
  validUntil?: string | null;
  skills: string[];
  description: string;
  isPublic: boolean;
}

export interface PublicSkillItemDTO {
  name: string;
  status: "Learning" | "Practicing" | "Project Experience" | "Proficient";
  note: string;
}

export interface PublicSkillCategoryDTO {
  title: string;
  tag: string;
  description: string;
  skills: PublicSkillItemDTO[];
}

export interface PublicEducationDTO {
  id: string;
  institution: string;
  qualification: string;
  specialization?: string | null;
  semester?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  notes?: string | null;
}

export interface PublicHackathonDTO {
  id: string;
  eventName: string;
  organizer?: string | null;
  projectName?: string | null;
  problemStatement?: string | null;
  technologies?: string | null;
  date?: string | null;
  result?: string | null;
  rank?: string | null;
  repositoryUrl?: string | null;
  demoUrl?: string | null;
}

export interface PublicPortfolioData {
  isConfigured: boolean;
  profile: PublicProfileDTO;
  projects: PublicProjectDTO[];
  certificates: PublicCertificateDTO[];
  skills: PublicSkillCategoryDTO[];
  education: PublicEducationDTO[];
  hackathons: PublicHackathonDTO[];
  experiences: Record<string, unknown>[];
  researchPapers: Record<string, unknown>[];
  openSourceContribs: Record<string, unknown>[];
}

/**
 * Validates that a GitHub URL is a specific project repository URL,
 * NOT a bare user profile URL (per Requirement 4).
 */
export function sanitizeRepoUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return null;

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname.includes("github.com")) {
      return trimmed; // External non-GitHub git host or valid link
    }
    // For GitHub, path must have at least 2 segments: /username/repository
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      return trimmed;
    }
    // Bare profile URL: do NOT treat as a project repository URL
    return null;
  } catch {
    return null;
  }
}

/**
 * Parses JSON arrays or comma-delimited strings into a clean string array.
 */
function parseStringList(val?: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
  } catch {
    // Fall back to comma-separated
  }
  return val.split(",").map((x) => x.trim()).filter(Boolean);
}

/**
 * Maps database project status string to UI status badge.
 */
function mapProjectStatus(dbStatus?: string | null): "Completed" | "In Active Development" | "Prototype" {
  if (!dbStatus) return "In Active Development";
  const s = dbStatus.toLowerCase();
  if (s.includes("complete")) return "Completed";
  if (s.includes("dev") || s.includes("progress")) return "In Active Development";
  return "Prototype";
}

/**
 * Maps database skill status string to UI skill status badge.
 */
function mapSkillStatus(dbStatus?: string | null): "Learning" | "Practicing" | "Project Experience" | "Proficient" {
  if (!dbStatus) return "Practicing";
  const s = dbStatus.toLowerCase();
  if (s === "demonstrated" || s === "proficient") return "Project Experience";
  if (s === "practiced" || s === "practicing") return "Practicing";
  if (s === "learning") return "Learning";
  return "Project Experience";
}

/**
 * Known certificate asset lookup by keyword match
 */
const KNOWN_CERT_ASSETS: Record<string, { image?: string; pdf?: string }> = {
  "ideathon": { image: "/uploads/certificates/acic-sgtu-ideathon-8-winner-2nd-place.jpg" },
  "synergy": { image: "/uploads/certificates/sgt-university-synergy-2025-nexus.jpg" },
  "azure fundamentals": { pdf: "/uploads/certificates/microsoft-certified-azure-fundamentals.pdf" },
  "azure ai": { pdf: "/uploads/certificates/microsoft-certified-azure-ai-fundamentals.pdf" },
  "linux": { pdf: "/uploads/certificates/linux-course-completion-asd-academy.pdf" },
  "networking": { pdf: "/uploads/certificates/networking-course-completion-asd-academy.pdf" },
  "wifi": { pdf: "/uploads/certificates/wifi-pentesting-course-completion-asd-academy.pdf" },
  "ethical hacking": { pdf: "/uploads/certificates/ethical-hacking-course-completion-asd-academy.pdf" },
};

function resolveCertAsset(title: string): { image?: string; pdf?: string } {
  const lower = title.toLowerCase();
  for (const [key, asset] of Object.entries(KNOWN_CERT_ASSETS)) {
    if (lower.includes(key)) {
      return asset;
    }
  }
  return {};
}

/**
 * Server-Side Data Fetcher for Public Portfolio Content:
 * Retrieves published records from Prisma ORM with strict public DTO projection.
 */
export async function getPublicPortfolioData(): Promise<PublicPortfolioData> {
  try {
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
            techInterests: true,
            isPublic: true,
          },
        },
      },
    });

    const defaultProfile: PublicProfileDTO = {
      fullName: user?.profile?.fullName || "Rahul Sehrawat",
      headline: user?.profile?.headline || "BTech CSE (AI & ML) Student | Cybersecurity & Web Security",
      about:
        user?.profile?.about ||
        "I am a BTech Computer Science and Engineering student specializing in Artificial Intelligence and Machine Learning, with a strong interest in Cybersecurity and Web Application Security Testing.\n\nI am building my technical foundation through programming, computer networking, Linux, machine learning, and hands-on practice with security tools such as Burp Suite and OWASP ZAP. I enjoy exploring how technology works, solving technical problems, and developing projects that combine practical engineering with innovative ideas.",
      location: user?.profile?.location || "Mankrola, Gurugram, Haryana, India",
      email: user?.profile?.email || "rsherawat2007@gmail.com",
      githubUrl: user?.profile?.githubUrl || "https://github.com/rsherawat2007-create",
      linkedinUrl:
        user?.profile?.linkedinUrl || "https://www.linkedin.com/in/rahul-sehrawat-6433aa2ab/?isSelfProfile=true",
      photoUrl: user?.profile?.photoUrl || "/profile.png",
      techInterests: user?.profile?.techInterests || "Ethical Hacking, AI/ML, Web Application Security, Network Defense",
    };

    if (!user) {
      return {
        isConfigured: false,
        profile: defaultProfile,
        projects: [],
        certificates: [],
        skills: [],
        education: [],
        hackathons: [],
        experiences: [],
        researchPapers: [],
        openSourceContribs: [],
      };
    }

    const [dbProjects, dbCerts, dbSkills, dbEdu, dbHackathons] = await Promise.all([
      prisma.project.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.certificate.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { issueDate: "desc" },
      }),
      prisma.skill.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.education.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { startDate: "desc" },
      }),
      prisma.hackathon.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { date: "desc" },
      }),
    ]);

    // Map Projects
    const projects: PublicProjectDTO[] = dbProjects.map((p) => {
      const techs = parseStringList(p.technologies);
      const safeRepoUrl = sanitizeRepoUrl(p.githubUrl);

      return {
        id: p.id,
        name: p.name,
        tagline: p.category || (p.name.includes("–") ? p.name.split("–")[1]?.trim() : "Software Engineering Project"),
        summary: p.summary || "Full-stack software engineering project.",
        problemStatement: p.problemStatement || "Engineered to address practical software and systems challenges.",
        solution: p.myContribution || "Designed and implemented robust architecture with clean separation of concerns.",
        technologies: techs.length > 0 ? techs : ["Python", "Algorithms", "Systems"],
        status: mapProjectStatus(p.status),
        githubUrl: safeRepoUrl,
        demoUrl: p.demoUrl || null,
        coreFeatures: parseStringList(p.featuresImpl).length > 0
          ? parseStringList(p.featuresImpl)
          : [
              "Automated verification routines with robust data persistence",
              "Modular component architecture with defensive input validation",
              "Optimized data querying minimizing operational latency",
            ],
        architectureDetails: [
          `Stack: ${(techs.slice(0, 4).join(", ")) || "Standard Library & Modern Frameworks"}`,
          "Storage: Relational database schemas and structured persistent data structures",
          "Security: Input sanitization, parameterization, and boundary check controls",
        ],
        technicalHighlights: [
          "Zero third-party bloat: engineered from core architectural principles",
          "Tested against edge cases and verified across multi-endpoint environments",
        ],
        isPublic: p.isPublic,
      };
    });

    // Map Certificates
    const certificates: PublicCertificateDTO[] = dbCerts.map((c) => {
      const asset = resolveCertAsset(c.title);
      const skills = parseStringList(c.skillsCovered);
      const formattedDate = c.issueDate
        ? new Date(c.issueDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Verified Credential";

      return {
        id: c.id,
        title: c.title,
        issuer: c.issuer || "Verified Credential Issuer",
        issueDate: formattedDate,
        credentialId: c.credentialId,
        verificationUrl: c.verificationUrl,
        pdfUrl: asset.pdf || null,
        imageUrl: asset.image || null,
        score: c.duration || null,
        validUntil: c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : undefined,
        skills: skills.length > 0 ? skills : ["Computer Science", "Practical Engineering"],
        description: c.notes || `Official certification earned from ${c.issuer || "authorized body"}.`,
        isPublic: c.isPublic,
      };
    });

    // Map Skills grouped by Category
    const categoryMap = new Map<string, PublicSkillItemDTO[]>();
    for (const s of dbSkills) {
      const cat = s.category || "General Technical Skills";
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push({
        name: s.name,
        status: mapSkillStatus(s.status),
        note: s.notes || s.description || "Core practical skill",
      });
    }

    const skills: PublicSkillCategoryDTO[] = Array.from(categoryMap.entries()).map(([title, items]) => {
      let tag = "PRACTICAL SKILLS";
      let desc = "Applied competencies and toolchain mastery.";
      if (title.toLowerCase().includes("program")) {
        tag = "LANGUAGES & RUNTIMES";
        desc = "Core algorithmic foundations, backend scripting, and systems programming.";
      } else if (title.toLowerCase().includes("cyber")) {
        tag = "DEFENSE & PENETRATION TESTING";
        desc = "Defensive concepts, web application penetration testing, and practical tool mastery.";
      } else if (title.toLowerCase().includes("ai") || title.toLowerCase().includes("ml")) {
        tag = "DATA SCIENCE & PREDICTIVE MODELS";
        desc = "Foundational predictive modeling, mathematical intuition, and Microsoft Azure AI.";
      } else if (title.toLowerCase().includes("tool") || title.toLowerCase().includes("dev")) {
        tag = "ENVIRONMENTS & UTILITIES";
        desc = "Day-to-day tools for source control, web interfaces, and distributed systems.";
      }

      return {
        title,
        tag,
        description: desc,
        skills: items,
      };
    });

    // Map Education
    const education: PublicEducationDTO[] = dbEdu.map((e) => ({
      id: e.id,
      institution: e.institution,
      qualification: e.qualification,
      specialization: e.specialization,
      semester: e.semester,
      startDate: e.startDate ? new Date(e.startDate).getFullYear().toString() : "2025",
      endDate: e.endDate ? new Date(e.endDate).getFullYear().toString() : "2029",
      status: e.status,
      notes: e.notes,
    }));

    // Map Hackathons
    const hackathons: PublicHackathonDTO[] = dbHackathons.map((h) => ({
      id: h.id,
      eventName: h.eventName,
      organizer: h.organizer,
      projectName: h.projectName,
      problemStatement: h.problemStatement,
      technologies: h.technologies,
      date: h.date ? new Date(h.date).toLocaleDateString() : undefined,
      result: h.result,
      rank: h.rank,
      repositoryUrl: h.repositoryUrl,
      demoUrl: h.demoUrl,
    }));

    return {
      isConfigured: true,
      profile: defaultProfile,
      projects,
      certificates,
      skills,
      education,
      hackathons,
      experiences: [],
      researchPapers: [],
      openSourceContribs: [],
    };
  } catch (error) {
    console.error("[getPublicPortfolioData Error]", error);
    // Return safe fallback rather than crashing
    return {
      isConfigured: false,
      profile: {
        fullName: "Rahul Sehrawat",
        headline: "BTech CSE Student | AI/ML | Cybersecurity",
        about: "Building intelligent systems and exploring cybersecurity through practical engineering.",
        location: "Gurugram, Haryana, India",
        email: "rsherawat2007@gmail.com",
        githubUrl: "https://github.com/rsherawat2007-create",
        linkedinUrl: "https://www.linkedin.com/in/rahul-sehrawat-6433aa2ab/",
        photoUrl: "/profile.png",
        techInterests: "AI/ML, Cybersecurity, Systems Programming",
      },
      projects: [],
      certificates: [],
      skills: [],
      education: [],
      hackathons: [],
      experiences: [],
      researchPapers: [],
      openSourceContribs: [],
    };
  }
}
