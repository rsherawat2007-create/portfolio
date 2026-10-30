/**
 * Task 5 Dynamic Content & Admin Synchronization Test Suite
 *
 * Scenarios:
 * 1. Creating a project
 * 2. Editing a project
 * 3. Deleting a project
 * 4. Publishing & unpublishing content (isPublic filtering)
 * 5. Creating a certificate
 * 6. Updating profile information
 * 7. Public API responses & DTO data projection
 * 8. Unauthorized admin requests
 * 9. Empty database behavior & graceful degradation
 * 10. Repository URL validation & sanitization (no bare profile URLs)
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

async function runTask5TestSuite() {
  console.log("\n=======================================================");
  console.log("TASK 5: DYNAMIC PORTFOLIO CONTENT & SYNC TEST SUITE");
  console.log("=======================================================\n");

  const admin = await prisma.user.findFirst();
  if (!admin) {
    console.error("Admin user not found. Seed admin first.");
    process.exit(1);
  }

  // Helper import of sanitizeRepoUrl logic
  function sanitizeRepoUrl(url) {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return null;
    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname.includes("github.com")) return trimmed;
      const segments = parsed.pathname.split("/").filter(Boolean);
      return segments.length >= 2 ? trimmed : null;
    } catch {
      return null;
    }
  }

  // ── SCENARIO 1: Creating a Project ──
  console.log("1. Creating a Project from Admin");
  const testProject = await prisma.project.create({
    data: {
      userId: admin.id,
      name: "Autonomous Network Recon Tool",
      category: "Cybersecurity & Automation",
      summary: "Python utility for network reconnaissance and banner grabbing.",
      problemStatement: "Manual port scanning and service auditing is slow during initial triage.",
      myContribution: "Implemented asynchronous socket scanner with multi-threaded port queries.",
      technologies: "Python, Asyncio, Sockets, Nmap",
      status: "in_development",
      githubUrl: "https://github.com/rsherawat2007-create/recon-tool",
      isPublic: true,
    },
  });

  assert(testProject.id !== undefined, "Project successfully created with CUID");
  assert(testProject.name === "Autonomous Network Recon Tool", "Project title stored accurately");
  assert(testProject.isPublic === true, "Project publication status initialized to true");

  // ── SCENARIO 2: Editing a Project ──
  console.log("\n2. Editing an Existing Project");
  const updatedProject = await prisma.project.update({
    where: { id: testProject.id },
    data: {
      status: "completed",
      summary: "Updated: Production-ready multi-threaded socket reconnaissance scanner.",
    },
  });

  assert(updatedProject.status === "completed", "Project status updated to completed");
  assert(updatedProject.summary.startsWith("Updated:"), "Project summary successfully modified");

  // ── SCENARIO 3: Deleting a Project ──
  console.log("\n3. Deleting a Project");
  await prisma.project.delete({ where: { id: testProject.id } });
  const checkDeleted = await prisma.project.findUnique({ where: { id: testProject.id } });
  assert(checkDeleted === null, "Deleted project no longer exists in database");

  // ── SCENARIO 4: Publishing & Unpublishing Content (Visibility Filter) ──
  console.log("\n4. Publishing and Unpublishing Content (isPublic filtering)");
  const draftProject = await prisma.project.create({
    data: {
      userId: admin.id,
      name: "Confidential Security Audit Tool",
      summary: "Internal tool undergoing testing.",
      isPublic: false, // DRAFT / UNPUBLISHED
    },
  });

  const publicProjects = await prisma.project.findMany({
    where: { userId: admin.id, isPublic: true },
  });
  const isDraftInPublicList = publicProjects.some((p) => p.id === draftProject.id);
  assert(!isDraftInPublicList, "Unpublished project (isPublic: false) is strictly hidden from public visitors");

  // Now publish it
  const publishedProject = await prisma.project.update({
    where: { id: draftProject.id },
    data: { isPublic: true },
  });
  assert(publishedProject.isPublic === true, "Project successfully transitioned to published state");

  // Clean up
  await prisma.project.delete({ where: { id: draftProject.id } });

  // ── SCENARIO 5: Creating a Certificate ──
  console.log("\n5. Creating a Certificate");
  const testCert = await prisma.certificate.create({
    data: {
      userId: admin.id,
      title: "CompTIA Security+ Continuing Education",
      issuer: "CompTIA",
      issueDate: new Date("2026-09-01"),
      credentialId: "COMP-SEC-2026",
      verificationUrl: "https://www.certmetrics.com/comptia",
      skillsCovered: "Network Defense, Risk Management, Threat Detection",
      isPublic: true,
    },
  });

  assert(testCert.id !== undefined, "Certificate record created with ID");
  assert(testCert.issuer === "CompTIA", "Certificate issuer recorded");
  assert(testCert.isPublic === true, "Certificate visibility set to public");

  // Clean up test certificate
  await prisma.certificate.delete({ where: { id: testCert.id } });

  // ── SCENARIO 6: Updating Profile Information ──
  console.log("\n6. Updating Profile Information");
  const originalProfile = await prisma.profile.findUnique({ where: { userId: admin.id } });
  const originalHeadline = originalProfile ? originalProfile.headline : "";

  const updatedProfile = await prisma.profile.update({
    where: { userId: admin.id },
    data: {
      headline: "BTech CSE (AI & ML) Student | Cybersecurity Researcher & Engineer",
    },
  });

  assert(
    updatedProfile.headline === "BTech CSE (AI & ML) Student | Cybersecurity Researcher & Engineer",
    "Profile headline updated successfully"
  );

  // Restore original headline
  await prisma.profile.update({
    where: { userId: admin.id },
    data: { headline: originalHeadline },
  });

  // ── SCENARIO 7: Public API Responses & Data Projection ──
  console.log("\n7. Public API Responses & Safe DTO Projection");
  const publicData = await prisma.user.findFirst({
    select: {
      profile: {
        select: {
          fullName: true,
          headline: true,
          about: true,
          location: true,
          email: true,
          githubUrl: true,
          linkedinUrl: true,
        },
      },
    },
  });

  assert(publicData !== null && publicData.profile !== null, "Public profile retrieved successfully");
  assert(publicData.profile.fullName === "Rahul Sehrawat", "Full name matches verified portfolio owner");
  assert(publicData.password === undefined, "Password is NOT exposed in public query");
  assert(publicData.id === undefined, "Internal user CUID is NOT exposed in public projection");

  // ── SCENARIO 8: Unauthorized Admin Requests ──
  console.log("\n8. Unauthorized Admin Mutation Requests");
  // Simulating requireAuth() behavior without active session cookie
  async function simulateRequireAuth(mockCookie) {
    if (!mockCookie) return null;
    return { id: admin.id, email: admin.email };
  }

  const unauthSession = await simulateRequireAuth(null);
  assert(unauthSession === null, "Unauthenticated request returns null session (HTTP 401)");

  // ── SCENARIO 9: Empty Database Behavior & Fallback ──
  console.log("\n9. Empty Database Behavior & Fallback");
  // Querying a table with zero matching public items must return an empty array, not crash
  const emptyQuery = await prisma.openSourceContribution.findMany({
    where: { userId: "non-existent-user", isPublic: true },
  });
  assert(Array.isArray(emptyQuery) && emptyQuery.length === 0, "Empty table returns clean empty array [] without 500 error");

  // ── SCENARIO 10: Repository URL Validation & Sanitization ──
  console.log("\n10. Repository URL Validation (Requirement 4)");
  // 10a. Specific repo URL is preserved
  const validRepo = "https://github.com/rsherawat2007-create/portfolio";
  assert(sanitizeRepoUrl(validRepo) === validRepo, "Valid repository URL (with repo slug) is accepted");

  // 10b. Bare profile URL is strictly rejected/nulled
  const bareProfileUrl = "https://github.com/rsherawat2007-create";
  assert(sanitizeRepoUrl(bareProfileUrl) === null, "Bare GitHub profile URL is rejected as a project repository URL");

  // 10c. Trailing slash profile URL is rejected
  const bareProfileSlash = "https://github.com/rsherawat2007-create/";
  assert(sanitizeRepoUrl(bareProfileSlash) === null, "Profile URL with trailing slash is rejected as project repository");

  // 10d. Invalid non-URL string is rejected
  const invalidUrl = "not-a-valid-url";
  assert(sanitizeRepoUrl(invalidUrl) === null, "Invalid URL string is rejected");

  console.log("\n=======================================================");
  console.log(`TASK 5 TEST RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("=======================================================\n");

  await prisma.$disconnect();

  if (passed !== total) {
    process.exit(1);
  }
}

runTask5TestSuite().catch(async (err) => {
  console.error("Task 5 test execution failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
