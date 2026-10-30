/**
 * Seeds verified skills into Prisma database for Rahul Sehrawat
 */

const { PrismaClient } = require("@prisma/client");

const SKILL_CATEGORIES = [
  {
    category: "Programming",
    skills: [
      { name: "Python", status: "demonstrated", notes: "Socket programming, linked lists, automation scripts" },
      { name: "C", status: "practiced", notes: "Pointers, memory management, low-level data structures" },
      { name: "C++", status: "practiced", notes: "Object-oriented programming, standard template library" },
      { name: "SQL", status: "learning", notes: "Relational queries, schema design, database normalization" },
    ],
  },
  {
    category: "Cybersecurity",
    skills: [
      { name: "Networking Fundamentals", status: "demonstrated", notes: "Certified 82.45% - TCP/IP, OSI model, subnetting, routing" },
      { name: "Linux", status: "demonstrated", notes: "Certified 69.05% - CLI navigation, permissions, bash scripting" },
      { name: "Kali Linux", status: "practiced", notes: "Security toolchain, terminal navigation, reconnaissance workflows" },
      { name: "Web Application Security", status: "learning", notes: "HTTP request/response analysis, OWASP testing methodology" },
      { name: "Burp Suite", status: "learning", notes: "Proxy interception, repeater, automated crawl workflows" },
      { name: "OWASP ZAP", status: "learning", notes: "Automated vulnerability scanning and security auditing" },
      { name: "Wireshark", status: "practiced", notes: "Packet inspection, protocol analysis, TCP handshakes" },
      { name: "OWASP Top 10", status: "learning", notes: "Access control failures, injection, cryptographic failures" },
      { name: "Ethical Hacking Fundamentals", status: "demonstrated", notes: "Certified 73.68% - Reconnaissance, vulnerability assessment" },
    ],
  },
  {
    category: "AI / ML",
    skills: [
      { name: "Machine Learning Fundamentals", status: "learning", notes: "Supervised vs. unsupervised paradigms, loss functions" },
      { name: "NumPy", status: "practiced", notes: "Multi-dimensional arrays, matrix operations, vectorized math" },
      { name: "Pandas", status: "practiced", notes: "Dataframes, dataset cleaning, feature transformation" },
      { name: "Decision Trees", status: "learning", notes: "Information gain, Gini impurity, classification rules" },
      { name: "Azure AI Fundamentals", status: "demonstrated", notes: "Microsoft Certified AI-900 (Credential: w6JFG-48DB)" },
    ],
  },
  {
    category: "Development Tools",
    skills: [
      { name: "Git", status: "demonstrated", notes: "Branching, commit history, merge conflicts, CLI workflows" },
      { name: "GitHub", status: "demonstrated", notes: "Repository management, pull requests, open-source workflow" },
      { name: "VS Code", status: "demonstrated", notes: "Primary IDE with extensions for Python, C/C++, and Next.js" },
      { name: "Socket Programming", status: "demonstrated", notes: "TCP sockets, multi-client concurrency, packet framing" },
      { name: "Next.js", status: "demonstrated", notes: "App Router, server/client components, API routes" },
      { name: "React", status: "demonstrated", notes: "Component lifecycle, state hooks, interactive interfaces" },
      { name: "Tailwind CSS", status: "demonstrated", notes: "Utility-first design, cyber dark theme, responsive layouts" },
    ],
  },
];

async function seedSkills() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found.");
      return;
    }

    const existingCount = await prisma.skill.count({ where: { userId: user.id } });
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} skills.`);
      return;
    }

    console.log("Seeding verified skills into database...");
    for (const cat of SKILL_CATEGORIES) {
      for (const s of cat.skills) {
        await prisma.skill.create({
          data: {
            userId: user.id,
            name: s.name,
            category: cat.category,
            status: s.status,
            notes: s.notes,
            isPublic: true,
          },
        });
      }
    }
    const total = await prisma.skill.count({ where: { userId: user.id } });
    console.log(`✓ Successfully seeded ${total} verified skills into database.`);
  } finally {
    await prisma.$disconnect();
  }
}

seedSkills().catch(console.error);
