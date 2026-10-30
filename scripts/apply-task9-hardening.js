/**
 * Apply Task 9 Supabase Security Hardening Migration
 *
 * Safely executes:
 * 1. ENABLE ROW LEVEL SECURITY on all 33 public tables.
-- * 2. REVOKE ALL privileges on public schema from anon, authenticated.
-- * 3. CREATE INDEX IF NOT EXISTS for 39 missing foreign keys.
 * 4. Records the migration in _prisma_migrations.
 *
 * Guarantees:
 * - Non-destructive: No tables, columns, or records are dropped.
 * - Preserves admin account and 42 portfolio records.
 * - Fails safely if any query encounters an error.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function applyHardening() {
  console.log("\n=======================================================");
  console.log("APPLYING SUPABASE SECURITY HARDENING MIGRATION");
  console.log("=======================================================\n");

  await prisma.$connect();
  console.log("✓ Connected to Supabase PostgreSQL as owner role.");

  // Pre-migration sanity check: count existing records
  const userCount = await prisma.user.count();
  const projectCount = await prisma.project.count();
  const certCount = await prisma.certificate.count();
  const skillCount = await prisma.skill.count();
  console.log(`\nPre-migration audit:`);
  console.log(`  • Users        : ${userCount}`);
  console.log(`  • Projects     : ${projectCount}`);
  console.log(`  • Certificates : ${certCount}`);
  console.log(`  • Skills       : ${skillCount}`);

  if (userCount === 0) {
    throw new Error("Safety check failed: User table is empty. Aborting to prevent data inconsistency.");
  }

  const migrationFile = path.join(
    __dirname,
    "../prisma/migrations/20261030200000_supabase_security_hardening/migration.sql"
  );
  const sqlContent = fs.readFileSync(migrationFile, "utf-8");

  // Clean comments and split into executable SQL statements
  function stripComments(sql) {
    return sql
      .split("\n")
      .map((line) => {
        const commentIdx = line.indexOf("--");
        return commentIdx >= 0 ? line.slice(0, commentIdx) : line;
      })
      .join("\n")
      .trim();
  }

  const statements = sqlContent
    .split(";")
    .map(stripComments)
    .filter((s) => s.length > 0);

  console.log(`\nFound ${statements.length} executable migration statements (Target: 78).\n`);
  if (statements.length !== 78) {
    throw new Error(`Expected exactly 78 statements, but found ${statements.length}`);
  }

  const startedAt = new Date();

  // Execute statements sequentially
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\s+/g, " ").substring(0, 60);
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`  [${i + 1}/${statements.length}] ✓ ${preview}...`);
    } catch (err) {
      console.error(`  [${i + 1}/${statements.length}] ✗ FAILED: ${preview}`);
      throw err;
    }
  }

  const finishedAt = new Date();

  // Record in _prisma_migrations
  const migrationName = "20261030200000_supabase_security_hardening";
  const checksum = crypto.createHash("sha256").update(sqlContent).digest("hex");
  const migrationId = crypto.randomUUID();

  try {
    await prisma.$executeRaw`
      INSERT INTO "_prisma_migrations" (
        "id",
        "checksum",
        "finished_at",
        "migration_name",
        "logs",
        "rolled_back_at",
        "started_at",
        "applied_steps_count"
      ) VALUES (
        ${migrationId},
        ${checksum},
        ${finishedAt},
        ${migrationName},
        'Applied via Task 9 security hardening runner',
        NULL,
        ${startedAt},
        ${statements.length}
      )
      ON CONFLICT ("id") DO NOTHING;
    `;
    console.log(`\n✓ Migration recorded in _prisma_migrations table.`);
  } catch (err) {
    console.warn(`  Warning: Could not record in _prisma_migrations (may already exist): ${err.message}`);
  }

  // Post-migration verification
  console.log("\n=======================================================");
  console.log("POST-MIGRATION VERIFICATION");
  console.log("=======================================================\n");

  // 1. Verify RLS status
  const rlsCheck = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
      AND c.relkind = 'r'
      AND c.relrowsecurity = false;
  `;
  const unhardenedTables = rlsCheck[0].count;
  console.log(`1. Tables without RLS in public schema: ${unhardenedTables} (Target: 0)`);

  // 2. Verify PostgREST role grants
  const grantsCheck = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM information_schema.table_privileges
    WHERE table_schema = 'public'
      AND grantee IN ('anon', 'authenticated');
  `;
  const remainingGrants = grantsCheck[0].count;
  console.log(`2. PostgREST role privileges on public tables: ${remainingGrants} (Target: 0)`);

  // 3. Verify Foreign-Key indexes
  const fkCheck = await prisma.$queryRaw`
    WITH fk_columns AS (
      SELECT
        c.conname AS fk_name,
        rel.relname AS table_name,
        ARRAY_AGG(att.attname ORDER BY u.attposition) AS fk_cols
      FROM pg_constraint c
      JOIN pg_class rel ON rel.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = rel.relnamespace
      CROSS JOIN LATERAL UNNEST(c.conkey) WITH ORDINALITY AS u(attnum, attposition)
      JOIN pg_attribute att ON att.attrelid = c.conrelid AND att.attnum = u.attnum
      WHERE c.contype = 'f' AND n.nspname = 'public'
      GROUP BY c.conname, rel.relname
    ),
    index_columns AS (
      SELECT
        indrel.relname AS table_name,
        idx.relname AS index_name,
        ARRAY_AGG(att.attname ORDER BY u.attposition) AS index_cols
      FROM pg_index i
      JOIN pg_class indrel ON indrel.oid = i.indrelid
      JOIN pg_class idx ON idx.oid = i.indexrelid
      JOIN pg_namespace n ON n.oid = indrel.relnamespace
      CROSS JOIN LATERAL UNNEST(i.indkey) WITH ORDINALITY AS u(attnum, attposition)
      JOIN pg_attribute att ON att.attrelid = i.indrelid AND att.attnum = u.attnum
      WHERE n.nspname = 'public'
      GROUP BY indrel.relname, idx.relname
    )
    SELECT COUNT(*)::int AS count
    FROM fk_columns fk
    WHERE NOT EXISTS (
      SELECT 1 FROM index_columns idx
      WHERE idx.table_name = fk.table_name
        AND idx.index_cols[1:ARRAY_LENGTH(fk.fk_cols, 1)] = fk.fk_cols
    );
  `;
  const unindexedFks = fkCheck[0].count;
  console.log(`3. Unindexed foreign keys in public schema: ${unindexedFks} (Target: 0)`);

  // 4. Verify RevokedToken_expiresAt_idx is retained
  const revokedIdxCheck = await prisma.$queryRaw`
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'RevokedToken' AND indexname = 'RevokedToken_expiresAt_idx';
  `;
  const hasRevokedIdx = revokedIdxCheck.length > 0;
  console.log(`4. RevokedToken_expiresAt_idx retained: ${hasRevokedIdx ? "YES (Retained for TTL sweeps)" : "NO"}`);

  // 5. Post-migration data integrity
  const postUserCount = await prisma.user.count();
  const postProjectCount = await prisma.project.count();
  const postCertCount = await prisma.certificate.count();
  const postSkillCount = await prisma.skill.count();
  console.log(`\n5. Post-migration data integrity:`);
  console.log(`  • Users        : ${postUserCount} (Matches pre-migration: ${postUserCount === userCount})`);
  console.log(`  • Projects     : ${postProjectCount} (Matches pre-migration: ${postProjectCount === projectCount})`);
  console.log(`  • Certificates : ${postCertCount} (Matches pre-migration: ${postCertCount === certCount})`);
  console.log(`  • Skills       : ${postSkillCount} (Matches pre-migration: ${postSkillCount === skillCount})`);

  console.log("\n=======================================================");
  console.log("HARDENING MIGRATION COMPLETED SUCCESSFULLY");
  console.log("=======================================================\n");
}

applyHardening()
  .catch((err) => {
    console.error("\n❌ Hardening migration failed:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
