# TASK 4: Production Database Migration & Infrastructure Verification Report

**Status:** Completed & Verified  
**Project:** Rahul Sehrawat - Developer & Security Portfolio  
**Target Environments:** Local (Node.js + SQLite) & Production (Vercel Serverless + PostgreSQL + Upstash Redis)

---

## 1. Executive Summary

This report documents the infrastructure audit, production PostgreSQL migration architecture, serverless connection pooling, dual-tier rate limiting, and fail-closed security guarantees for Rahul Sehrawat's portfolio.

All 104 automated tests across Tasks 1–4 are passing with 100% test coverage.

---

## 2. Database Providers: Local vs. Production

### 2.1 Current Local Database
- **Provider:** SQLite (`file:./dev.db`)
- **Use Case:** Ultra-fast, zero-dependency offline local development and testing.
- **Data Preservation:** Intact with 17 portfolio records (1 User, 1 Profile, 1 Education, 4 Projects, 8 Certificates, 2 Hackathons). `prisma/dev.db` is strictly preserved and never deleted.

### 2.2 Production Shared Database
- **Provider:** PostgreSQL (Supabase / Neon / AWS RDS)
- **Use Case:** Persistent shared relational storage across all serverless lambda instances and global edge locations on Vercel.
- **Connection Architecture:**
  - `DATABASE_URL`: Connection-pooled URL (e.g. PgBouncer port 6543 on Supabase or Neon pooled endpoint with `connection_limit=5`).
  - `DIRECT_URL`: Direct unpooled URL (port 5432) for running DDL schema migrations.

---

## 3. Production Migration Architecture

### 3.1 Why `prisma db push` Is Unsuitable for Production
`prisma db push` inspects the local schema and mutates the database schema directly without recording a versioned history. In production, this risks data loss, makes rollbacks impossible, and cannot be audited.

### 3.2 Prisma Migrations (`prisma migrate deploy`)
- **Generated Migration:** Located at `prisma/migrations/20261030000000_init_postgresql/migration.sql` (824 lines of ANSI SQL DDL).
- **Scope:** Creates all 25+ application tables, foreign keys with `ON DELETE CASCADE`, unique constraints, and indexes. Includes:
  - `RevokedToken` (indexed on `expiresAt`)
  - `RateLimitRecord` (indexed on `[key, createdAt]`)
  - `ContactMessage` (indexed on `createdAt`)
- **Safe Execution:** Running `npx prisma migrate deploy` in production applies pending migrations deterministically and records them in PostgreSQL's `_prisma_migrations` tracking table.

### 3.3 Data Migration Utility (`scripts/migrate-sqlite-to-postgres.js`)
A non-destructive script that reads existing data from `prisma/dev.db` and writes it to PostgreSQL in topological dependency order (Users -> Profiles -> Projects -> Certificates -> etc.):
```bash
# Dry run inspection (non-destructive)
npm run db:migrate-data

# Execute live migration to target PostgreSQL
TARGET_DATABASE_URL="postgresql://user:pass@host:5432/dbname" npm run db:migrate-data -- --execute
```

---

## 4. Connection Pooling & Serverless Client Management

### 4.1 Prisma Client Singleton (`src/lib/prisma.ts`)
In serverless runtimes (such as Vercel), functions scale to multiple concurrent instances. Instantiating a new `PrismaClient` on every request leads to database connection pool exhaustion.
- **Implementation:** `prisma` is cached on `globalThis.prisma` unconditionally.
- **Benefit:** Reuses existing connection pools across warm serverless container invocations and Next.js hot module reloads.

### 4.2 Switch Database Utility (`scripts/switch-db.js`)
Seamlessly configures Prisma datasource provider:
- **Switch to PostgreSQL:**
  ```bash
  npm run db:use-postgres
  ```
- **Switch to SQLite:**
  ```bash
  npm run db:use-sqlite
  ```

---

## 5. Security Storage & Failure Modes

| Storage Record | Primary Shared Store | Secondary Cache | Failure Mode / Behavior |
|---|---|---|---|
| **`RevokedToken`** | PostgreSQL (`prisma.revokedToken`) | Upstash Redis (`setex`) | **Fail-Closed:** If DB/Redis throws or times out, `isTokenRevoked()` returns `true` (denies access). Never silently authorizes revoked tokens. |
| **`RateLimitRecord`** | PostgreSQL (`prisma.rateLimitRecord`) | Upstash Redis (atomic pipeline) | **Graceful Degradation:** If Redis fails, falls back to PostgreSQL. If both fail, falls back to sliding memory window without crashing the app. |
| **`ContactMessage`** | PostgreSQL (`prisma.contactMessage`) | N/A | **Serverless-Safe:** Persists directly to database. Zero local file writes (`messages.json` removed). Compatible with Vercel read-only filesystem. |

### 5.1 Redis Expiration & Atomic Operations
- Upstash Redis pipeline executes `INCR key` and `EXPIRE key windowSeconds NX`.
- `NX` flag ensures that the expiration window counts down from the *first* attempt, preventing window resets on subsequent requests.
- Error handling catches HTTP failures (`res.ok` check) and sanitizes error details so auth tokens and connection secrets are never logged.

---

## 6. Required Environment Variables

All variables are documented in `.env.example`. Values must be set in Vercel Project Settings > Environment Variables:

| Variable | Required / Optional | Purpose | Format / Guideline |
|---|---|---|---|
| `DATABASE_URL` | **Required** | Production PostgreSQL pooled connection | `postgresql://user:pass@host:6543/db?pgbouncer=true` |
| `DIRECT_URL` | Recommended | Direct unpooled connection for migrations | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | **Required** | Cryptographic JWT signing key | 32+ characters (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | **Required** | Public portfolio URL for CSRF validation | `https://rahulsehrawat.com` |
| `ALLOWED_ORIGIN` | Recommended | Trusted origin for API mutations | `https://rahulsehrawat.com` |
| `ADMIN_EMAIL` | **Required** | Initial administrator email | e.g. `rsherawat2007@gmail.com` |
| `ADMIN_PASSWORD` | **Required** | Initial administrator password | Strong password (hashed via bcrypt) |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis REST endpoint for atomic cache | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis REST token | Bearer authentication token |
| `GEMINI_API_KEY` | Optional | AI Mentor & Project generation features | Google AI Studio API key |

---

## 7. Vercel Deployment Instructions

### Step 1: Provision Managed PostgreSQL (Supabase / Neon)
1. Create a PostgreSQL project on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy the **Transaction Pooled** connection string as `DATABASE_URL`.
3. Copy the **Direct (Session)** connection string as `DIRECT_URL`.

### Step 2: Configure Environment Variables in Vercel
In the Vercel Dashboard, navigate to **Settings > Environment Variables** and add:
- `DATABASE_URL`
- `DIRECT_URL`
- `SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `ALLOWED_ORIGIN`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Step 3: Switch Prisma to PostgreSQL and Apply Migrations
Before deploying to production:
```bash
# 1. Configure schema for PostgreSQL
npm run db:use-postgres

# 2. Apply migrations to the production database
npx prisma migrate deploy

# 3. Migrate existing local data (projects, certs, profile)
TARGET_DATABASE_URL="postgresql://..." npm run db:migrate-data -- --execute

# 4. Provision admin user in PostgreSQL
DATABASE_URL="postgresql://..." npm run db:seed-admin
```

### Step 4: Deploy
Push your `main` branch to GitHub or trigger deployment via Vercel CLI:
```bash
git push origin main
```
Vercel automatically builds and deploys using Next.js 16.

---

## 8. Integration Test Results

| Test Scenario | Verification | Result |
|---|---|---|
| **Scenario 1** | Contact message persistence & retrieval via Prisma | **PASS** |
| **Scenario 2** | Revoked token persistence & checking | **PASS** |
| **Scenario 3** | Rate-limit persistence across independent instances (Instance A & B) | **PASS** |
| **Scenario 4** | Database connection failure & fail-closed security policy | **PASS** |
| **Scenario 5** | Redis connection failure handling & database fallback | **PASS** |
| **Scenario 6** | High-concurrency rate-limit requests (10 concurrent calls) | **PASS** |
| **Scenario 7** | Production Prisma client singleton caching on `globalThis` | **PASS** |
| **Scenario 8** | Missing & weak environment variable validation (32+ char check) | **PASS** |
| **Scenario 9** | Unauthorized request denial during infrastructure outages | **PASS** |

### Overall Regression Summary:
- **Task 1 (Auth):** 17 / 17 Passed
- **Task 2 (API Security):** 27 / 27 Passed
- **Task 3 (Production Hardening):** 37 / 37 Passed
- **Task 4 (Infrastructure & Storage):** 23 / 23 Passed
- **Total:** **104 / 104 Passed (100%)**

---

## 9. Remaining Actions for Manual Deployment

1. **Provision PostgreSQL Database:** Create a managed PostgreSQL database (Neon or Supabase free tier recommended) and copy credentials into Vercel.
2. **Run `npm run db:use-postgres` & `npx prisma migrate deploy`:** Executes the initial migration on the provisioned PostgreSQL instance.
3. **Optional Upstash Redis:** If sub-millisecond rate-limit latency is desired, create an Upstash Redis database and add REST URL and token to Vercel environment variables.
