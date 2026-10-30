# TASK 10: VERCEL + SUPABASE PRODUCTION CONNECTION VERIFICATION REPORT

**Project:** Rahul Sehrawat Engineering Portfolio  
**Repository:** https://github.com/rsherawat2007-create/portfolio  
**Production URL:** [https://portfolio-sooty-five-88.vercel.app](https://portfolio-sooty-five-88.vercel.app)  
**Latest Deployed Commit:** `52a74e7dd59b55a90e3d958d0d29d11cf4813000` (`main`)  
**Production Database:** Supabase PostgreSQL (`aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`)  
**Audit Date:** 2026-10-30  
**Status:** **100% VERIFIED & OPERATIONAL**

---

## 1. Component Verification Summary

| Component | Status | Detailed Verification Result |
|---|---|---|
| **GitHub** | **Connected** | Branch `main` is clean, tracked, and synchronized with remote `rsherawat2007-create/portfolio.git` at commit `52a74e7`. |
| **Vercel** | **Connected** | Linked to project `portfolio` (`prj_UxI95Aj55fCyKYK4gOfhRoh1MSjB`) under account `team_9V1CSVXTw0q2CpZk6Kc9JxER`. Auto-deployments trigger from GitHub `main`. |
| **Supabase** | **Connected** | Project is fully accessible via connection pooler (port 6543) and direct connection (port 5432) in EU-West-1. |
| **PostgreSQL** | **Working** | PostgreSQL 17.11 running with 33 public tables, all protected with Row Level Security (RLS) and 0 unindexed foreign keys. |
| **Prisma** | **Working** | Prisma Client 5.22.0 generates cleanly, executes pooled queries, and maps schema models 1:1 with PostgreSQL relations. |
| **Production Deployment** | **Working** | Deployment `dpl_5xJGGUzxYzSosW4AZHMUi6aS7K2w` is in state `READY` serving HTTP/2 200 with strict security headers. |
| **Public Portfolio Data** | **Working** | Live `/api/public` endpoint returns `isConfigured: true` and dynamically serves all 42 migrated records directly from Supabase. |
| **Admin Authentication** | **Working** | Live login verifies admin credentials against Supabase PostgreSQL bcrypt hash, sets `HttpOnly; Secure; SameSite=Lax` cookie, validates `/api/auth/me`, and successfully revokes session tokens upon logout. |
| **Vercel Blob** | **Not configured** | Library `@vercel/blob` integrated with strict magic-bytes validation and 10MB limits; server-side token `BLOB_READ_WRITE_TOKEN` can be provisioned in Vercel Dashboard when photo/document uploads are needed in production. |

---

## 2. GitHub Verification (Phase 1)

1. **Current Branch:** `main`
2. **Latest Commit:** `52a74e7dd59b55a90e3d958d0d29d11cf4813000`
   - *Message:* `feat(security): complete Task 9 Supabase database security hardening & Vercel build configuration`
3. **Remote Status:** Up to date with `origin/main` (`https://github.com/rsherawat2007-create/portfolio.git`).
4. **Working Tree:** 100% clean, 0 uncommitted changes.
5. **Vercel Connection:** Connected to GitHub repository `rsherawat2007-create/portfolio` with automated CI deployment webhooks.

---

## 3. Vercel Configuration & Environment Audit (Phase 2)

### Project Configuration
- **Project Name:** `portfolio`
- **Project ID:** `prj_UxI95Aj55fCyKYK4gOfhRoh1MSjB`
- **Framework Preset:** Next.js
- **Node.js Version:** 26.x
- **Build Command:** `prisma generate && next build --webpack` (configured in `package.json` with `postinstall: "prisma generate"`)
- **Output Directory:** Default Next.js build output (`.next`)
- **Latest Deployment:** `dpl_5xJGGUzxYzSosW4AZHMUi6aS7K2w` (Target: `production`, State: `READY`)
- **Domains & Aliases:**
  - `portfolio-sooty-five-88.vercel.app` (Primary production URL)
  - `portfolio-rahul-c565.vercel.app`
  - `portfolio-git-main-rahul-c565.vercel.app`

### Environment Variable Audit (Production Environment)

| Environment Variable Name | Configured in Vercel | Purpose & Classification |
|---|---|---|
| `DATABASE_URL` | **YES** | Supabase connection pooler with `?pgbouncer=true` (Port 6543) [Sensitive] |
| `DIRECT_URL` | **YES** | Supabase direct PostgreSQL connection (Port 5432) [Sensitive] |
| `SESSION_SECRET` | **YES** | Cryptographically generated 64-byte secret for JWT session signing [Sensitive] |
| `NEXT_PUBLIC_SITE_URL` | **YES** | Canonical production site URL (`https://portfolio-rahul-c565.vercel.app`) [Plain] |
| `ADMIN_EMAIL` | **NO (Not Required)** | Seed-only variable. Runtime authentication validates directly against the `User` table in PostgreSQL. |
| `ADMIN_PASSWORD` | **NO (Not Required)** | Seed-only variable. Passwords are never stored in plaintext and exist as bcrypt hashes in PostgreSQL. |
| `BLOB_READ_WRITE_TOKEN` | **NO (Optional)** | Persistent cloud file upload token for `@vercel/blob`. |
| `UPSTASH_REDIS_REST_URL` | **NO (Optional)** | Optional Redis cache. Rate limiting and JWT revocation automatically fall back to Supabase PostgreSQL. |
| `UPSTASH_REDIS_REST_TOKEN` | **NO (Optional)** | Optional Redis token. |

---

## 4. Supabase & PostgreSQL Verification (Phases 3 & 4)

A live, safe, read-only query was executed against the Supabase production database using the application's Prisma connection configuration:

### Connection Parameters
- **Database Name:** `postgres`
- **Connected Role:** `postgres` (`rolbypassrls = true`, table owner)
- **Session Role:** `postgres`
- **PostgreSQL Version:** `PostgreSQL 17.11`
- **Host:** `aws-0-eu-west-1.pooler.supabase.com`

### Table Inventory & RLS Verification
- **Total Public Tables:** 33
- **Tables Protected by RLS:** **33 of 33 (100%)**
- **Unhardened Tables:** **0**
- **Grants to PostgREST (`anon`, `authenticated`):** **0** (All public table access revoked; strict default-deny enforced)
- **Covering Foreign-Key Indexes:** **41 of 41 foreign keys covered** (0 unindexed foreign keys)
- **`RevokedToken_expiresAt_idx`:** **Retained** and verified for TTL session pruning queries.

### Production Record Counts (Preservation Check)
All **42 core portfolio records** and the admin user account migrated in Task 8 were verified intact:

| Model | Record Count | Verification Status |
|---|---|---|
| `User` | 1 | `rsherawat2007@gmail.com` with bcrypt hash (`$2b$12$...`) |
| `Profile` | 1 | Rahul Sehrawat (Gurugram, Haryana, India) |
| `Project` | 4 | Security Management System, Tic Tac Toe LAN, Contact Management System, Automated Recon Tool |
| `Certificate` | 8 | Microsoft AI-900, Cisco Networking, HackerRank Python/SQL, Linux, Ethical Hacking |
| `Skill` | 25 | Across 4 categories (Programming, Cybersecurity, AI/ML, Development Tools) |
| `Education` | 1 | SGT University (BTech CSE AI & ML) |
| `Hackathon` | 2 | SYNERGY 2025, IDEATHON 8.0 |
| `ProjectMilestone` | 0 | Ready for admin dashboard updates |
| `UserSettings` | 1 | Dark theme, user preferences |
| **Total Core Records** | **42** | **100% Preserved** |

---

## 5. Live Vercel Production Runtime Verification (Phase 5)

Live HTTP requests were executed against `https://portfolio-sooty-five-88.vercel.app` to confirm that the production application retrieves real data from Supabase and enforces all security controls:

### 1. Homepage & Security Headers
- **Status:** `HTTP/2 200`
- **Security Headers Verified:**
  - `Content-Security-Policy`: Present and enforced
  - `X-Frame-Options`: `DENY`
  - `X-Content-Type-Options`: `nosniff`
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
- **Content:** Confirmed rendering dynamic name "Rahul Sehrawat" and portfolio layout.

### 2. Public API Data Exposure (`/api/public`)
- **Status:** `HTTP/2 200` with `success: true`
- **`isConfigured` Flag:** `true` (proves real Supabase PostgreSQL connection is active)
- **Data Retrieved from Supabase:**
  - Profile: Rahul Sehrawat (`rsherawat2007@gmail.com`)
  - 4 Projects returned with technology stacks and architecture details
  - 8 Certificates returned with issuer, issue dates, and verification credentials
  - 25 Skills returned across 4 technical categories
  - 1 Education record (SGT University)
  - 2 Hackathons (SYNERGY 2025, IDEATHON 8.0)
- **Data Sanitization Audit:** Zero exposure of `password`, `geminiApiKey`, `userSettings`, or internal `userId` CUIDs.

### 3. Protected Route Enforcement
- `GET /api/profile` without session cookie: **HTTP 401 Unauthorized**
- `GET /api/auth/me` without session cookie: **HTTP 401 Unauthorized**
- `POST /api/upload` without session cookie: **HTTP 401 Unauthorized**

### 4. Admin Authentication & Session Management
- **Invalid Credentials:** `POST /api/auth/login` with incorrect credentials strictly rejected with **HTTP 401** ("Invalid email or password").
- **Valid Admin Login:** `POST /api/auth/login` with admin credentials returned **HTTP 200**.
  - `Set-Cookie` header issued `portfolio_admin_session` with `HttpOnly`, `Secure`, and `SameSite=Lax`.
- **Authenticated Requests:**
  - `GET /api/profile` with session cookie: **HTTP 200 OK**
  - `GET /api/auth/me` with session cookie: **HTTP 200 OK** (`success: true`, `email: "rsherawat2007@gmail.com"`)
- **Logout & Revocation:**
  - `POST /api/auth/logout`: **HTTP 200 OK** (token `jti` persisted to `RevokedToken` table in Supabase)
  - Subsequent request to `/api/profile` using the revoked session cookie: strictly rejected with **HTTP 401 Unauthorized**.

---

## 6. Storage & Security Verification (Phase 6)

- **Upload Endpoint:** [`src/app/api/upload/route.ts`](file:///Users/rahulsehrawat/Desktop/Portfolio/src/app/api/upload/route.ts)
- **Authentication Required:** Enforced via `requireAuth()` (HTTP 401 for unauthenticated calls).
- **File Validation:** Cryptographic magic-bytes signature verification (`validateFileSignature`) rejects spoofed extensions and executable polyglots.
- **File Size Restriction:** Enforces 10 MB maximum upload limit (`MAX_FILE_SIZE`).
- **Path Traversal Defense:** `generateSafeFilename` sanitizes user filenames and attaches cryptographic random suffixes.
- **Vercel Blob Integration:** Ready for token provisioning; fails safely with an informative error rather than crashing serverless runtimes when unprovisioned.

---

## 7. Connection Issues Identified & Resolved (Phase 7)

1. **Issue 1: Outdated/Unconnected Database URL in Vercel Environment**
   - *Root Cause:* Vercel initially held an old placeholder `DATABASE_URL` linked to an empty integration store, missing `DIRECT_URL`.
   - *Fix:* Synchronized production `DATABASE_URL` (Supabase connection pooler port 6543) and `DIRECT_URL` (direct port 5432) to Vercel via MCP API.
2. **Issue 2: Missing Session Secret in Production**
   - *Root Cause:* `SESSION_SECRET` was not configured in Vercel production environment variables.
   - *Fix:* Generated a high-entropy 64-byte secret and configured `SESSION_SECRET` as a sensitive environment variable in Vercel.
3. **Issue 3: Missing Prisma Client Generation in Vercel CI**
   - *Root Cause:* Vercel build command `next build --webpack` failed because `@prisma/client` was not pre-generated during `npm install`.
   - *Fix:* Added `"postinstall": "prisma generate"` and updated `"build": "prisma generate && next build --webpack"` in `package.json`.

---

## 8. Remaining Manual Actions

All core connections (GitHub → Vercel → Supabase PostgreSQL) are automated and active. No manual actions are required for general operation.
- **Optional:** If document/photo uploads are required through the admin dashboard in production, navigate to **Vercel Dashboard → Storage → Create Blob Store** and connect it to the `portfolio` project to automatically provision `BLOB_READ_WRITE_TOKEN`.
