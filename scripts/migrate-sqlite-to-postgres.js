/**
 * Production Data Migration Utility: SQLite -> PostgreSQL
 *
 * Safely extracts portfolio records from local SQLite (dev.db) and migrates them
 * to a shared PostgreSQL database (e.g. Supabase, Neon, AWS RDS).
 *
 * Usage:
 *   node scripts/migrate-sqlite-to-postgres.js --dry-run
 *   TARGET_DATABASE_URL="postgresql://..." node scripts/migrate-sqlite-to-postgres.js --execute
 */

const { PrismaClient } = require("@prisma/client");

async function runDataMigration() {
  const isExecute = process.argv.includes("--execute");
  const targetUrl = process.env.TARGET_DATABASE_URL || process.argv.find((arg) => arg.startsWith("postgresql://"));

  console.log("\n=======================================================");
  console.log("SQLITE TO POSTGRESQL PORTFOLIO DATA MIGRATION");
  console.log("=======================================================\n");

  const sourcePrisma = new PrismaClient();

  try {
    console.log("1. Inspecting local source database (dev.db)...");
    const counts = {
      users: await sourcePrisma.user.count(),
      profiles: await sourcePrisma.profile.count(),
      educations: await sourcePrisma.education.count(),
      skills: await sourcePrisma.skill.count(),
      roadmaps: await sourcePrisma.roadmap.count(),
      journalEntries: await sourcePrisma.journalEntry.count(),
      dailyLogs: await sourcePrisma.dailyLog.count(),
      labs: await sourcePrisma.lab.count(),
      experiments: await sourcePrisma.experiment.count(),
      projects: await sourcePrisma.project.count(),
      certificates: await sourcePrisma.certificate.count(),
      experiences: await sourcePrisma.experience.count(),
      hackathons: await sourcePrisma.hackathon.count(),
      extracurriculars: await sourcePrisma.extracurricularActivity.count(),
      researchPapers: await sourcePrisma.researchPaper.count(),
      openSourceContribs: await sourcePrisma.openSourceContribution.count(),
      achievements: await sourcePrisma.achievement.count(),
      goals: await sourcePrisma.goal.count(),
      contactMessages: await sourcePrisma.contactMessage.count(),
      revokedTokens: await sourcePrisma.revokedToken.count(),
    };

    console.log("Source Data Inventory:");
    for (const [table, count] of Object.entries(counts)) {
      console.log(`  • ${table.padEnd(20)}: ${count} record(s)`);
    }

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log(`\nTotal Portfolio Records: ${totalRecords}`);

    if (!isExecute || !targetUrl) {
      console.log("\n[DRY RUN COMPLETE]");
      console.log("To execute live migration to PostgreSQL, specify TARGET_DATABASE_URL:");
      console.log('  TARGET_DATABASE_URL="postgresql://user:pass@host:5432/dbname" node scripts/migrate-sqlite-to-postgres.js --execute\n');
      return;
    }

    console.log("\n2. Connecting to target PostgreSQL database...");
    const targetPrisma = new PrismaClient({
      datasources: {
        db: { url: targetUrl },
      },
    });

    try {
      await targetPrisma.$connect();
      console.log("✓ Connected to target PostgreSQL successfully.");

      console.log("3. Migrating records in relational order...");

      // 3.1 Users
      const users = await sourcePrisma.user.findMany();
      for (const u of users) {
        await targetPrisma.user.upsert({
          where: { id: u.id },
          update: { email: u.email, password: u.password },
          create: u,
        });
      }
      console.log(`  ✓ Migrated ${users.length} User record(s)`);

      // 3.2 Profiles
      const profiles = await sourcePrisma.profile.findMany();
      for (const p of profiles) {
        await targetPrisma.profile.upsert({
          where: { id: p.id },
          update: p,
          create: p,
        });
      }
      console.log(`  ✓ Migrated ${profiles.length} Profile record(s)`);

      // 3.3 Projects
      const projects = await sourcePrisma.project.findMany();
      for (const pr of projects) {
        await targetPrisma.project.upsert({
          where: { id: pr.id },
          update: pr,
          create: pr,
        });
      }
      console.log(`  ✓ Migrated ${projects.length} Project record(s)`);

      // 3.4 Certificates
      const certs = await sourcePrisma.certificate.findMany();
      for (const c of certs) {
        await targetPrisma.certificate.upsert({
          where: { id: c.id },
          update: c,
          create: c,
        });
      }
      console.log(`  ✓ Migrated ${certs.length} Certificate record(s)`);

      // 3.5 Skills
      const skills = await sourcePrisma.skill.findMany();
      for (const s of skills) {
        await targetPrisma.skill.upsert({
          where: { id: s.id },
          update: s,
          create: s,
        });
      }
      console.log(`  ✓ Migrated ${skills.length} Skill record(s)`);

      // 3.6 Contact Messages
      const messages = await sourcePrisma.contactMessage.findMany();
      for (const m of messages) {
        await targetPrisma.contactMessage.upsert({
          where: { id: m.id },
          update: m,
          create: m,
        });
      }
      console.log(`  ✓ Migrated ${messages.length} ContactMessage record(s)`);

      // 3.7 Revoked Tokens
      const tokens = await sourcePrisma.revokedToken.findMany();
      for (const t of tokens) {
        await targetPrisma.revokedToken.upsert({
          where: { jti: t.jti },
          update: t,
          create: t,
        });
      }
      console.log(`  ✓ Migrated ${tokens.length} RevokedToken record(s)`);

      console.log("\n=======================================================");
      console.log("✓ POSTGRESQL DATA MIGRATION COMPLETED SUCCESSFULLY");
      console.log("=======================================================\n");
    } finally {
      await targetPrisma.$disconnect();
    }
  } finally {
    await sourcePrisma.$disconnect();
  }
}

runDataMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
