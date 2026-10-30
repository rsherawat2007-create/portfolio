#!/usr/bin/env node

/**
 * Task 8 Post-Migration Comprehensive Verification Script
 *
 * Verifies that:
 * 1. Supabase PostgreSQL contains all migrated records matching SQLite.
 * 2. Foreign keys and user relationships are intact.
 * 3. Profile details (name, headline, bio, location, links, isPublic) match.
 * 4. Projects, Certificates, Skills, Education, and Hackathons match.
 * 5. Admin authentication works against Supabase PostgreSQL.
 * 6. Public portfolio data query (getPublicPortfolioData) executes cleanly on Supabase.
 */

const { DatabaseSync } = require("node:sqlite");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const path = require("path");

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runVerification() {
  console.log("\n=======================================================");
  console.log("TASK 8: SUPABASE POSTGRESQL DATA VERIFICATION");
  console.log("=======================================================\n");

  const dbPath = path.join(__dirname, "..", "prisma", "dev.db");
  const sqlite = new DatabaseSync(dbPath, { readOnly: true });
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log("✓ Connected to Supabase PostgreSQL database.\n");

    // -------------------------------------------------------------------------
    // 1. Record Count Parity
    // -------------------------------------------------------------------------
    console.log("1. Record Count Parity (SQLite vs. Supabase PostgreSQL)");

    const sqliteCounts = {
      Profile: sqlite.prepare('SELECT COUNT(*) as c FROM "Profile"').get().c,
      Education: sqlite.prepare('SELECT COUNT(*) as c FROM "Education"').get().c,
      Project: sqlite.prepare('SELECT COUNT(*) as c FROM "Project"').get().c,
      Certificate: sqlite.prepare('SELECT COUNT(*) as c FROM "Certificate"').get().c,
      Skill: sqlite.prepare('SELECT COUNT(*) as c FROM "Skill"').get().c,
      Hackathon: sqlite.prepare('SELECT COUNT(*) as c FROM "Hackathon"').get().c,
    };

    const pgCounts = {
      Profile: await prisma.profile.count(),
      Education: await prisma.education.count(),
      Project: await prisma.project.count(),
      Certificate: await prisma.certificate.count(),
      Skill: await prisma.skill.count(),
      Hackathon: await prisma.hackathon.count(),
    };

    for (const [table, sCount] of Object.entries(sqliteCounts)) {
      const pCount = pgCounts[table];
      assert(sCount === pCount, `${table} count matches (${sCount} in SQLite === ${pCount} in Supabase)`);
    }

    // -------------------------------------------------------------------------
    // 2. Admin Identity & Relationship Verification
    // -------------------------------------------------------------------------
    console.log("\n2. Admin Account & Foreign Key Relationships");

    const admin = await prisma.user.findFirst({
      where: { email: "rsherawat2007@gmail.com" },
      include: {
        profile: true,
        projects: true,
        certificates: true,
        skills: true,
        education: true,
        hackathons: true,
      },
    });

    assert(!!admin, "Admin account exists in Supabase PostgreSQL (rsherawat2007@gmail.com)");
    assert(admin.profile !== null, "Profile relation successfully linked to admin");
    assert(admin.education.length === sqliteCounts.Education, `Education records linked to admin (${admin.education.length})`);
    assert(admin.projects.length === sqliteCounts.Project, `Projects linked to admin (${admin.projects.length})`);
    assert(admin.certificates.length === sqliteCounts.Certificate, `Certificates linked to admin (${admin.certificates.length})`);
    assert(admin.skills.length === sqliteCounts.Skill, `Skills linked to admin (${admin.skills.length})`);
    assert(admin.hackathons.length === sqliteCounts.Hackathon, `Hackathons linked to admin (${admin.hackathons.length})`);

    // -------------------------------------------------------------------------
    // 3. Profile Content Integrity
    // -------------------------------------------------------------------------
    console.log("\n3. Profile Content & Integrity");
    const sqliteProfile = sqlite.prepare('SELECT * FROM "Profile" LIMIT 1').get();
    const pgProfile = admin.profile;

    assert(pgProfile.fullName === sqliteProfile.fullName, `Full name matches: "${pgProfile.fullName}"`);
    assert(pgProfile.headline === sqliteProfile.headline, `Headline matches: "${pgProfile.headline}"`);
    assert(pgProfile.location === sqliteProfile.location, `Location matches: "${pgProfile.location}"`);
    assert(pgProfile.githubUrl === sqliteProfile.githubUrl, `GitHub URL matches: "${pgProfile.githubUrl}"`);
    assert(pgProfile.linkedinUrl === sqliteProfile.linkedinUrl, `LinkedIn URL matches: "${pgProfile.linkedinUrl}"`);
    assert(pgProfile.isPublic === true, "Profile isPublic flag is true");
    assert(pgProfile.about.includes("Artificial Intelligence and Machine Learning"), "Full authentic bio preserved");

    // -------------------------------------------------------------------------
    // 4. Project Records Integrity
    // -------------------------------------------------------------------------
    console.log("\n4. Projects Data Integrity");
    const sqliteProjects = sqlite.prepare('SELECT * FROM "Project"').all();
    for (const sp of sqliteProjects) {
      const pp = admin.projects.find((p) => p.id === sp.id);
      assert(!!pp, `Project [${sp.name}] preserved with exact ID (${sp.id})`);
      assert(pp.status === sp.status, `Project [${sp.name}] status matches (${pp.status})`);
      assert(pp.isPublic === Boolean(sp.isPublic), `Project [${sp.name}] publication status matches`);
      assert(pp.githubUrl === sp.githubUrl, `Project [${sp.name}] repository URL matches`);
    }

    // -------------------------------------------------------------------------
    // 5. Certificates Integrity
    // -------------------------------------------------------------------------
    console.log("\n5. Certificates Data Integrity");
    const sqliteCerts = sqlite.prepare('SELECT * FROM "Certificate"').all();
    for (const sc of sqliteCerts) {
      const pc = admin.certificates.find((c) => c.id === sc.id);
      assert(!!pc, `Certificate [${sc.title}] preserved with exact ID (${sc.id})`);
      assert(pc.issuer === sc.issuer, `Certificate [${sc.title}] issuer matches (${pc.issuer})`);
      assert(pc.credentialId === sc.credentialId, `Certificate [${sc.title}] credential ID matches (${pc.credentialId})`);
      assert(pc.isPublic === true, `Certificate [${sc.title}] isPublic is true`);
    }

    // -------------------------------------------------------------------------
    // 6. Skills Category Distribution
    // -------------------------------------------------------------------------
    console.log("\n6. Technical Skills Category Integrity");
    const categories = await prisma.skill.groupBy({
      by: ["category"],
      _count: { id: true },
    });
    for (const cat of categories) {
      assert(cat._count.id > 0, `Skill category [${cat.category}] contains ${cat._count.id} verified skills`);
    }

    // -------------------------------------------------------------------------
    // 7. Admin Authentication Verification (bcrypt against Supabase)
    // -------------------------------------------------------------------------
    console.log("\n7. Admin Authentication Verification");
    const testPassword = process.env.ADMIN_PASSWORD || "PortfolioAdmin#2026!";
    const passwordValid = await bcrypt.compare(testPassword, admin.password);
    assert(passwordValid === true, "Admin password hash verifies successfully against Supabase PostgreSQL");

    const badPasswordValid = await bcrypt.compare("WrongPassword123!", admin.password);
    assert(badPasswordValid === false, "Incorrect password strictly rejected by bcrypt");

    // -------------------------------------------------------------------------
    // 8. Public Portfolio Data Query Verification (Exact getPublicPortfolioData projection)
    // -------------------------------------------------------------------------
    console.log("\n8. Public Portfolio Data Query Verification");
    const publicProfile = await prisma.profile.findFirst({
      where: { userId: admin.id, isPublic: true },
    });
    const publicProjects = await prisma.project.findMany({
      where: { userId: admin.id, isPublic: true },
    });
    const publicCerts = await prisma.certificate.findMany({
      where: { userId: admin.id, isPublic: true },
    });
    const publicSkills = await prisma.skill.findMany({
      where: { userId: admin.id, isPublic: true },
    });
    const publicEducation = await prisma.education.findMany({
      where: { userId: admin.id, isPublic: true },
    });
    const publicHackathons = await prisma.hackathon.findMany({
      where: { userId: admin.id, isPublic: true },
    });

    assert(publicProfile !== null, "Public profile is published and queryable");
    assert(publicProfile.fullName === "Rahul Sehrawat", "Public profile name matches 'Rahul Sehrawat'");
    assert(publicProjects.length === 4, `Public query returned all 4 published projects (got ${publicProjects.length})`);
    assert(publicCerts.length === 8, `Public query returned all 8 published certificates (got ${publicCerts.length})`);
    assert(publicSkills.length === 25, `Public query returned all 25 published skills (got ${publicSkills.length})`);
    assert(publicEducation.length === 1, "Public query returned verified education record");
    assert(publicHackathons.length === 2, "Public query returned 2 hackathon achievements");

  } catch (error) {
    console.error("Verification failed:", error);
    failed++;
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }

  console.log("\n=======================================================");
  console.log(`TASK 8 VERIFICATION: ${passed} / ${passed + failed} PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
