/**
 * Phase 1 Security Audit Script for Supabase PostgreSQL
 *
 * Inspects:
 * 1. Public schema tables and RLS status
 * 2. Role grants (anon, authenticated, service_role, postgres)
 * 3. Foreign keys without indexes
 * 4. Index statistics on RevokedToken
 * 5. Sensitive columns in User
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function audit() {
  console.log("\n=======================================================");
  console.log("PHASE 1: SUPABASE POSTGRESQL SECURITY AUDIT");
  console.log("=======================================================\n");

  await prisma.$connect();
  console.log("✓ Connected to Supabase PostgreSQL.\n");

  // 1. Audit RLS on public tables
  console.log("1. Row Level Security (RLS) Status on Public Tables:");
  const rlsStatus = await prisma.$queryRaw`
    SELECT 
      c.relname AS table_name,
      c.relrowsecurity AS rls_enabled,
      c.relforcerowsecurity AS rls_forced
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
      AND c.relkind = 'r'
    ORDER BY c.relname;
  `;
  
  let rlsDisabledCount = 0;
  for (const row of rlsStatus) {
    const status = row.rls_enabled ? "ENABLED" : "DISABLED (VULNERABLE)";
    if (!row.rls_enabled) rlsDisabledCount++;
    console.log(`  • ${row.table_name.padEnd(28)}: ${status}`);
  }
  console.log(`\nTotal tables: ${rlsStatus.length} | RLS Disabled: ${rlsDisabledCount}\n`);

  // 2. Audit Table Grants on Public Schema for API Roles
  console.log("2. Table Grants for PostgREST Roles (anon, authenticated):");
  const grants = await prisma.$queryRaw`
    SELECT 
      table_name,
      grantee,
      string_agg(privilege_type, ', ') AS privileges
    FROM information_schema.table_privileges
    WHERE table_schema = 'public'
      AND grantee IN ('anon', 'authenticated')
    GROUP BY table_name, grantee
    ORDER BY table_name, grantee;
  `;
  if (grants.length === 0) {
    console.log("  No explicit grants found for anon / authenticated.");
  } else {
    for (const g of grants.slice(0, 15)) {
      console.log(`  • ${g.table_name.padEnd(25)} | ${g.grantee.padEnd(14)} | ${g.privileges}`);
    }
    if (grants.length > 15) {
      console.log(`  ... and ${grants.length - 15} more grants across public tables.`);
    }
  }

  // 3. Audit Unindexed Foreign Keys
  console.log("\n3. Foreign Keys and Supporting Indexes:");
  const unindexedFks = await prisma.$queryRaw`
    WITH fk_columns AS (
      SELECT
        c.conname AS fk_name,
        rel.relname AS table_name,
        ARRAY_AGG(att.attname ORDER BY u.attposition) AS fk_cols,
        confrel.relname AS foreign_table_name
      FROM pg_constraint c
      JOIN pg_class rel ON rel.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = rel.relnamespace
      JOIN pg_class confrel ON confrel.oid = c.confrelid
      CROSS JOIN LATERAL UNNEST(c.conkey) WITH ORDINALITY AS u(attnum, attposition)
      JOIN pg_attribute att ON att.attrelid = c.conrelid AND att.attnum = u.attnum
      WHERE c.contype = 'f' AND n.nspname = 'public'
      GROUP BY c.conname, rel.relname, confrel.relname
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
    SELECT
      fk.table_name,
      fk.fk_name,
      fk.fk_cols::text,
      fk.foreign_table_name,
      EXISTS (
        SELECT 1 FROM index_columns idx
        WHERE idx.table_name = fk.table_name
          -- An index covers the FK if the FK columns are a prefix of the index columns
          AND idx.index_cols[1:ARRAY_LENGTH(fk.fk_cols, 1)] = fk.fk_cols
      ) AS is_indexed
    FROM fk_columns fk
    ORDER BY fk.table_name, fk.fk_name;
  `;

  let unindexedCount = 0;
  for (const fk of unindexedFks) {
    const status = fk.is_indexed ? "INDEXED" : "UNINDEXED (MISSING INDEX)";
    if (!fk.is_indexed) unindexedCount++;
    console.log(`  • ${fk.table_name.padEnd(25)} (${fk.fk_cols}) -> ${fk.foreign_table_name}: ${status}`);
  }
  console.log(`\nTotal Foreign Keys: ${unindexedFks.length} | Unindexed: ${unindexedCount}\n`);

  // 4. Audit RevokedToken Indexes & Usage
  console.log("4. RevokedToken Indexes & Statistics:");
  const revokedTokenIndexes = await prisma.$queryRaw`
    SELECT
      i.indexrelname AS index_name,
      i.idx_scan AS scans_count,
      i.idx_tup_read AS tuples_read,
      i.idx_tup_fetch AS tuples_fetched,
      pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
      pg_get_indexdef(i.indexrelid) AS definition
    FROM pg_stat_user_indexes i
    JOIN pg_class c ON c.oid = i.relid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'RevokedToken'
    ORDER BY i.indexrelname;
  `;
  for (const idx of revokedTokenIndexes) {
    console.log(`  • Index: ${idx.index_name}`);
    console.log(`    - Scans Count   : ${idx.scans_count}`);
    console.log(`    - Index Size    : ${idx.index_size}`);
    console.log(`    - Definition    : ${idx.definition}`);
  }

  // 5. Audit User Table Columns
  console.log("\n5. User Table Column Schema & Sensitivity:");
  const userColumns = await prisma.$queryRaw`
    SELECT 
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User'
    ORDER BY ordinal_position;
  `;
  for (const col of userColumns) {
    const sensitive = col.column_name === "password" ? "CRITICAL (PASSWORD HASH)" : "Normal";
    console.log(`  • ${col.column_name.padEnd(16)}: ${col.data_type.padEnd(16)} [${sensitive}]`);
  }

  console.log("\n=======================================================");
  console.log("AUDIT COMPLETE");
  console.log("=======================================================\n");
}

audit()
  .catch((err) => {
    console.error("Audit failed:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
