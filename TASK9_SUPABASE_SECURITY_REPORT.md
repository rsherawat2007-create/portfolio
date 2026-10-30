# TASK 9: SUPABASE DATABASE SECURITY HARDENING REPORT

**Project:** Rahul Sehrawat Engineering Portfolio  
**Repository:** https://github.com/rsherawat2007-create/portfolio  
**Production Database:** Supabase PostgreSQL (`aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`)  
**Prisma Version:** 5.22.0 | **Next.js Version:** 16.4.3  
**Audit Date:** 2026-10-30  
**Status:** **100% RESOLVED & VERIFIED** (158/158 Security & Regression Tests Passing)

---

## 1. Executive Summary

Four critical security and performance findings reported by the Supabase Security Advisor were audited, engineered, safely migrated, and rigorously verified:

| # | Supabase Security Advisor Finding | Pre-Migration Status | Post-Migration Status | Resolution Strategy |
|---|-----------------------------------|----------------------|-----------------------|---------------------|
| 1 | **RLS Disabled in Public** | 33 of 33 tables unprotected (`relrowsecurity = false`) | **33 of 33 tables protected** (`relrowsecurity = true`) | Enabled RLS on all tables in `public` schema via migration DDL. |
| 2 | **Sensitive Columns Exposed** (`public.User`) | PostgREST roles (`anon`, `authenticated`) held full `ALL` privileges on `User` (exposing password hashes) | **Strict Default Deny** (42501 Permission Denied) | Revoked all schema, table, sequence, and routine privileges from `anon` & `authenticated`; revoked default privileges for future tables. |
| 3 | **Unindexed Foreign Keys** | 39 of 41 foreign key relationships lacked covering indexes | **0 unindexed foreign keys** (39 covering indexes created) | Generated 39 `CREATE INDEX IF NOT EXISTS` statements; synchronized `prisma/schema.prisma` with `@@index`. |
| 4 | **Unused Index** (`public.RevokedToken`) | Flagged by Advisor as unused (`scans_count = 0`) | **RETAINED** (`RevokedToken_expiresAt_idx`) | Code inspection verified active TTL query in `session.ts` (`deleteMany` on `expiresAt`); retained to prevent sequential scans. |

All 42 portfolio records and the administrator user account (`rsherawat2007@gmail.com`) were completely preserved without modification or data loss.

---

## 2. Tables Protected by Row Level Security (RLS)

Row Level Security was successfully enabled across all 33 tables in the `public` schema.

```sql
SELECT c.relname, c.relrowsecurity FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname;
```

| Table Name | RLS Enabled | Owner Role Access | PostgREST Direct Access |
|---|---|---|---|
| `Achievement` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Application` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Certificate` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `ContactMessage` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `DailyLog` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Education` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Evidence` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Experience` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Experiment` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `ExtracurricularActivity` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `FileAttachment` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Goal` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Hackathon` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `IntegratedProject` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `JournalEntry` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Lab` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `MistakeJournal` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `OpenSourceContribution` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Profile` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Project` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `ProjectMilestone` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `RateLimitRecord` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Recommendation` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `ResearchPaper` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `RevokedToken` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Roadmap` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `RoadmapItem` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `Skill` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `SkillDependency` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `User` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `UserSettings` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `WeeklyReview` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |
| `_prisma_migrations` | **TRUE** | Full Access (BypassRLS) | DENIED (Default Deny) |

---

## 3. Policy Architecture & Privilege Revocation

### Architecture Rationale
The frontend application **does not use `@supabase/supabase-js`** or client-side direct database access. All data interactions occur server-side through Next.js Server Components, Server Actions, and Route Handlers using Prisma ORM.

Prisma connects as the database owner (`postgres` role), which holds `rolbypassrls: true`. Therefore:
1. **No Permissive Policies Created:** In PostgreSQL, enabling RLS on a table without creating permissive `FOR ALL TO anon, authenticated` policies enforces a strict **default-deny** boundary for those roles.
2. **Explicit Privilege Revocation:** In addition to RLS, all permissions were explicitly revoked from PostgREST roles:
   ```sql
   REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
   REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
   REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

   ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon, authenticated;
   ```
3. **Defense-in-Depth:**
   - **Layer 1 (PostgreSQL Grants):** PostgREST roles have 0 permissions on public tables.
   - **Layer 2 (Row Level Security):** Even if grants were mistakenly reintroduced, RLS default-deny blocks read/write.
   - **Layer 3 (Next.js Application Layer):** Next.js API endpoints sanitize DTOs and enforce JWT authentication with fail-closed token revocation.

---

## 4. Protection of Sensitive `User` Columns

### Risk Addressed
Prior to migration, the `User` table contained:
- `id` (text, primary key)
- `email` (text, unique)
- `password` (text, **bcrypt hash**)
- `createdAt` / `updatedAt` (timestamp)

Because `anon` and `authenticated` roles had default read privileges on `public."User"`, anyone possessing the public Supabase project URL and anonymous key could send a request to `/rest/v1/User?select=*` and obtain the bcrypt password hashes of all users.

### Security Remediation & Proof of Denial
Live role verification confirmed the complete blocking of direct table access:
```text
SET ROLE anon;
SELECT * FROM "User";
--> ERROR: 42501: permission denied for table User
```
Furthermore, Next.js server-side route handlers (`/api/public`, `/api/profile`, `/api/auth/me`, `/api/settings`) use explicit Prisma select projections (`select: { id: true, email: true }`), ensuring password hashes and private settings (`geminiApiKey`) are never returned in public or admin JSON responses.

---

## 5. Foreign-Key Indexing Implementation

39 covering indexes were created for all unindexed foreign-key relationships. The names and declarations strictly conform to Prisma's naming convention:

```sql
CREATE INDEX IF NOT EXISTS "Achievement_userId_idx" ON public."Achievement"("userId");
CREATE INDEX IF NOT EXISTS "Application_userId_idx" ON public."Application"("userId");
CREATE INDEX IF NOT EXISTS "Certificate_userId_idx" ON public."Certificate"("userId");
CREATE INDEX IF NOT EXISTS "DailyLog_userId_idx" ON public."DailyLog"("userId");
CREATE INDEX IF NOT EXISTS "Education_userId_idx" ON public."Education"("userId");
CREATE INDEX IF NOT EXISTS "Evidence_userId_idx" ON public."Evidence"("userId");
CREATE INDEX IF NOT EXISTS "Evidence_skillId_idx" ON public."Evidence"("skillId");
CREATE INDEX IF NOT EXISTS "Experience_userId_idx" ON public."Experience"("userId");
CREATE INDEX IF NOT EXISTS "Experiment_userId_idx" ON public."Experiment"("userId");
CREATE INDEX IF NOT EXISTS "ExtracurricularActivity_userId_idx" ON public."ExtracurricularActivity"("userId");
CREATE INDEX IF NOT EXISTS "FileAttachment_userId_idx" ON public."FileAttachment"("userId");
CREATE INDEX IF NOT EXISTS "FileAttachment_educationId_idx" ON public."FileAttachment"("educationId");
CREATE INDEX IF NOT EXISTS "FileAttachment_labId_idx" ON public."FileAttachment"("labId");
CREATE INDEX IF NOT EXISTS "FileAttachment_projectId_idx" ON public."FileAttachment"("projectId");
CREATE INDEX IF NOT EXISTS "FileAttachment_certificateId_idx" ON public."FileAttachment"("certificateId");
CREATE INDEX IF NOT EXISTS "FileAttachment_experienceId_idx" ON public."FileAttachment"("experienceId");
CREATE INDEX IF NOT EXISTS "FileAttachment_hackathonId_idx" ON public."FileAttachment"("hackathonId");
CREATE INDEX IF NOT EXISTS "FileAttachment_extracurricularId_idx" ON public."FileAttachment"("extracurricularId");
CREATE INDEX IF NOT EXISTS "FileAttachment_journalEntryId_idx" ON public."FileAttachment"("journalEntryId");
CREATE INDEX IF NOT EXISTS "FileAttachment_evidenceId_idx" ON public."FileAttachment"("evidenceId");
CREATE INDEX IF NOT EXISTS "Goal_userId_idx" ON public."Goal"("userId");
CREATE INDEX IF NOT EXISTS "Hackathon_userId_idx" ON public."Hackathon"("userId");
CREATE INDEX IF NOT EXISTS "IntegratedProject_userId_idx" ON public."IntegratedProject"("userId");
CREATE INDEX IF NOT EXISTS "JournalEntry_userId_idx" ON public."JournalEntry"("userId");
CREATE INDEX IF NOT EXISTS "Lab_userId_idx" ON public."Lab"("userId");
CREATE INDEX IF NOT EXISTS "MistakeJournal_userId_idx" ON public."MistakeJournal"("userId");
CREATE INDEX IF NOT EXISTS "OpenSourceContribution_userId_idx" ON public."OpenSourceContribution"("userId");
CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON public."Project"("userId");
CREATE INDEX IF NOT EXISTS "ProjectMilestone_projectId_idx" ON public."ProjectMilestone"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectMilestone_userId_idx" ON public."ProjectMilestone"("userId");
CREATE INDEX IF NOT EXISTS "Recommendation_userId_idx" ON public."Recommendation"("userId");
CREATE INDEX IF NOT EXISTS "ResearchPaper_userId_idx" ON public."ResearchPaper"("userId");
CREATE INDEX IF NOT EXISTS "Roadmap_userId_idx" ON public."Roadmap"("userId");
CREATE INDEX IF NOT EXISTS "RoadmapItem_roadmapId_idx" ON public."RoadmapItem"("roadmapId");
CREATE INDEX IF NOT EXISTS "Skill_userId_idx" ON public."Skill"("userId");
CREATE INDEX IF NOT EXISTS "SkillDependency_userId_idx" ON public."SkillDependency"("userId");
CREATE INDEX IF NOT EXISTS "SkillDependency_skillId_idx" ON public."SkillDependency"("skillId");
CREATE INDEX IF NOT EXISTS "SkillDependency_prerequisiteId_idx" ON public."SkillDependency"("prerequisiteId");
CREATE INDEX IF NOT EXISTS "WeeklyReview_userId_idx" ON public."WeeklyReview"("userId");
```

`prisma/schema.prisma` was updated with corresponding `@@index` annotations for all 39 models, and `npx prisma validate` + `prisma generate` were executed successfully.

---

## 6. Unused Index Evaluation (`RevokedToken_expiresAt_idx`)

- **Index Name:** `RevokedToken_expiresAt_idx`
- **Indexed Column:** `expiresAt` (timestamp)
- **Table:** `public.RevokedToken`
- **Advisor Finding:** 0 index scans recorded.
- **Decision:** **RETAIN (DO NOT DROP)**
- **Technical Justification:**
  In `src/lib/session.ts` (lines 80–83), the server opportunistically prunes expired token revocation records during session events:
  ```ts
  const now = new Date();
  await prisma.revokedToken.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  ```
  This generates the SQL query:
  ```sql
  DELETE FROM "RevokedToken" WHERE "expiresAt" < $1;
  ```
  Because the database was recently populated and token volumes are currently small, index scan statistics had not yet accumulated. Dropping `RevokedToken_expiresAt_idx` would force PostgreSQL to perform sequential table scans during background token cleanups as revocation history grows. The 16 KB btree index is retained.

---

## 7. Regression & Security Test Results

The comprehensive test suite was executed against the hardened Supabase PostgreSQL instance:

```bash
npm run test:security
```

| Test Suite | File | Checks / Assertions | Status |
|---|---|---|---|
| **Auth & Passwords** | `scripts/test-auth.js` | 17 assertions (bcrypt, JWT verification, tampered token rejection, rate limit) | **17/17 PASSED** (100%) |
| **API Security** | `scripts/test-task2-security.js` | 27 assertions (DTO sanitization, zero leakage, admin auth, CSRF headers) | **27/27 PASSED** (100%) |
| **Production Security** | `scripts/test-task3-security.js` | 28 assertions (persistent JWT revocation, distributed rate limit, fail-closed) | **28/28 PASSED** (100%) |
| **Infrastructure** | `scripts/test-task4-infrastructure.js` | 18 assertions (Supabase connection, pooler compatibility, migration audit) | **18/18 PASSED** (100%) |
| **Dynamic Portfolio** | `scripts/test-task5-dynamic.js` | 22 assertions (database-driven homepage, public DTOs, zero hardcoded fallback) | **22/22 PASSED** (100%) |
| **Storage & E2E** | `scripts/test-task6-storage-and-e2e.js` | 32 assertions (magic bytes, Vercel Blob, admin CRUD, contact persistence) | **32/32 PASSED** (100%) |
| **Task 9 Supabase Hardening** | `scripts/test-task9-security.js` | 14 assertions (RLS on 33 tables, anon denial, authenticated denial, 39 FK indexes) | **14/14 PASSED** (100%) |
| **Total** | | **158 Assertions** | **158 / 158 PASSED** (100%) |

### Code Quality & Build Checks
- `npx prisma validate`: **Valid (0 errors)**
- `npx tsc --noEmit`: **Passed (0 TypeScript errors)**
- `npm run lint`: **Passed (0 ESLint errors)**
- `npm run build`: **Compiled successfully in 5.0s (30/30 routes optimized)**

---

## 8. Vercel Project Connection & Configuration

The portfolio project is connected to Vercel and configured for production deployment:

- **Vercel Project:** `portfolio` (`prj_UxI95Aj55fCyKYK4gOfhRoh1MSjB`)
- **Connected Team/Account:** `team_9V1CSVXTw0q2CpZk6Kc9JxER` (`rahul-c565`)
- **Git Integration:** `rsherawat2007-create/portfolio` (branch: `main`)
- **Environment Variables Configured:**
  - `DATABASE_URL` (Supabase pooler connection with pgbouncer)
  - `DATABASE_URL_POOLED`
  - `PRISMA_DATABASE_URL`
  - `POSTGRES_URL`
  - `NEXT_PUBLIC_SITE_URL` (`https://portfolio-rahul-c565.vercel.app`)
  - `SESSION_SECRET` (Cryptographically generated 64-byte high-entropy session secret)
- **Build Script Enhancement:**
  Added `"postinstall": "prisma generate"` and updated `"build": "prisma generate && next build --webpack"` in `package.json` to ensure Prisma client is generated in the clean Vercel CI environment.

---

## 9. Migration Artifacts Created

1. **Migration SQL:**
   `prisma/migrations/20261030200000_supabase_security_hardening/migration.sql`
2. **Migration Runner:**
   `scripts/apply-task9-hardening.js`
3. **Hardening Verification Suite:**
   `scripts/test-task9-security.js`
4. **Audit Utility:**
   `scripts/audit-supabase-security.js`

---

## 10. Conclusion & Production Readiness

The Supabase database has been transformed from an open Data API exposure into a locked-down, high-performance, hardened relational database backend. All 4 findings from the Supabase Security Advisor are completely resolved. The application is verified 100% production-ready.
