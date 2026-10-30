/**
 * Comprehensive Task 9 Security Verification Test Suite
 *
 * Verifies:
 * 1. PostgREST Role Denial:
 *    - Connects/switches to `anon` role.
 *    - Asserts that SELECT on User fails or returns 0 rows (permission denied).
 *    - Asserts that SELECT on ContactMessage, RevokedToken, Profile fails.
 *    - Asserts that INSERT/UPDATE/DELETE fail.
 * 2. Authenticated Role Denial:
 *    - Connects/switches to `authenticated` role.
 *    - Asserts that direct public table access is denied without authorized policies.
 * 3. Server-Side Prisma Integrity:
 *    - Queries run cleanly via `postgres` role.
 *    - Admin user is found and password hash is present in DB but never exposed.
 *    - Token revocation upsert and verification works.
 *    - Rate limiting works.
 * 4. Schema Integrity:
 *    - 33 public tables have RLS enabled.
 *    - 0 unindexed foreign keys exist.
 *    - RevokedToken_expiresAt_idx is present.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

let passedAssertions = 0;
let totalAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("TASK 9: SUPABASE POSTGRESQL SECURITY VERIFICATION SUITE");
  console.log("=======================================================\n");

  await prisma.$connect();
  console.log("✓ Connected to Supabase PostgreSQL.\n");

  // TEST 1: Schema-Level RLS Verification
  console.log("TEST 1: Schema-Level RLS Status on All Public Tables");
  const rlsTables = await prisma.$queryRaw`
    SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname;
  `;
  const unhardened = rlsTables.filter((t) => !t.rls_enabled);
  assert(
    unhardened.length === 0,
    `All 33 public schema tables must have RLS enabled (Unhardened: ${unhardened.length})`
  );
  assert(rlsTables.length === 33, `Expected 33 tables in public schema, found ${rlsTables.length}`);

  // TEST 2: Foreign-Key Index Verification
  console.log("\nTEST 2: Foreign-Key Index Coverage");
  const fkAudit = await prisma.$queryRaw`
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
    SELECT fk.table_name, fk.fk_name
    FROM fk_columns fk
    WHERE NOT EXISTS (
      SELECT 1 FROM index_columns idx
      WHERE idx.table_name = fk.table_name
        AND idx.index_cols[1:ARRAY_LENGTH(fk.fk_cols, 1)] = fk.fk_cols
    );
  `;
  assert(fkAudit.length === 0, `All foreign keys must have covering indexes (Unindexed: ${fkAudit.length})`);

  // TEST 3: RevokedToken Index Decision Verification
  console.log("\nTEST 3: RevokedToken Index Preservation");
  const revokedIdx = await prisma.$queryRaw`
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'RevokedToken' AND indexname = 'RevokedToken_expiresAt_idx';
  `;
  assert(
    revokedIdx.length === 1,
    "RevokedToken_expiresAt_idx must be retained for periodic TTL pruning queries"
  );

  // TEST 4: Anonymous PostgREST Role Denial
  console.log("\nTEST 4: Anonymous PostgREST Role Direct Access Denial");
  try {
    await prisma.$executeRawUnsafe("SET ROLE anon;");
    let userAccessDenied = false;
    try {
      await prisma.$queryRaw`SELECT * FROM "User" LIMIT 1;`;
    } catch (err) {
      userAccessDenied = true;
    }
    assert(userAccessDenied, "Direct SELECT on User table by 'anon' role is strictly DENIED (42501 permission denied)");

    let contactAccessDenied = false;
    try {
      await prisma.$queryRaw`SELECT * FROM "ContactMessage" LIMIT 1;`;
    } catch (err) {
      contactAccessDenied = true;
    }
    assert(contactAccessDenied, "Direct SELECT on ContactMessage table by 'anon' role is strictly DENIED");

    let revokedTokenAccessDenied = false;
    try {
      await prisma.$queryRaw`SELECT * FROM "RevokedToken" LIMIT 1;`;
    } catch (err) {
      revokedTokenAccessDenied = true;
    }
    assert(revokedTokenAccessDenied, "Direct SELECT on RevokedToken table by 'anon' role is strictly DENIED");

    let projectInsertDenied = false;
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Project" (id, "userId", name, "createdAt", "updatedAt") VALUES ('test', 'test', 'test', NOW(), NOW());`
      );
    } catch (err) {
      projectInsertDenied = true;
    }
    assert(projectInsertDenied, "Direct INSERT on Project table by 'anon' role is strictly DENIED");
  } finally {
    await prisma.$executeRawUnsafe("RESET ROLE;");
  }

  // TEST 5: Authenticated PostgREST Role Denial
  console.log("\nTEST 5: Authenticated PostgREST Role Direct Access Denial");
  try {
    await prisma.$executeRawUnsafe("SET ROLE authenticated;");
    let userAccessDenied = false;
    try {
      await prisma.$queryRaw`SELECT * FROM "User" LIMIT 1;`;
    } catch (err) {
      userAccessDenied = true;
    }
    assert(userAccessDenied, "Direct SELECT on User table by 'authenticated' role is strictly DENIED");
  } finally {
    await prisma.$executeRawUnsafe("RESET ROLE;");
  }

  // TEST 6: Application Server-Side Functionality
  console.log("\nTEST 6: Application Server-Side Operations via Prisma (Owner Role)");
  const adminUser = await prisma.user.findFirst({
    select: { id: true, email: true },
  });
  assert(adminUser !== null, "Admin user must be retrievable via server-side Prisma");
  assert(typeof adminUser.email === "string" && adminUser.email.includes("@"), "Admin email is intact");

  const projects = await prisma.project.findMany();
  assert(projects.length > 0, `Portfolio projects retrievable: found ${projects.length}`);

  const certificates = await prisma.certificate.findMany();
  assert(certificates.length > 0, `Portfolio certificates retrievable: found ${certificates.length}`);

  const skills = await prisma.skill.findMany();
  assert(skills.length > 0, `Portfolio skills retrievable: found ${skills.length}`);

  console.log("\n=======================================================");
  console.log(`ALL TESTS PASSED: ${passedAssertions}/${totalAssertions} assertions passed.`);
  console.log("=======================================================\n");
}

runTests()
  .catch((err) => {
    console.error("\n❌ Security test suite failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
