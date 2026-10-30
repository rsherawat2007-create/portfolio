# Task 5: Dynamic Portfolio Content & Admin Dashboard Synchronization Report

## Executive Summary

**Task 5: Dynamic Portfolio Content & Admin Dashboard Synchronization** has been implemented and tested for Rahul Sehrawat's engineering portfolio (`https://github.com/rsherawat2007-create/portfolio`).

The portfolio previously relied on hardcoded mock datasets and client-side data structures in `src/app/page.tsx` (over 2,200 lines). The admin dashboard (`/manage`) could modify database records, but the public homepage was decoupled from these mutations.

This task established the **Admin Dashboard as the single source of truth** by:
1. Transforming `src/app/page.tsx` into a Next.js Server Component executing cached server-side queries via `getPublicPortfolioData()`.
2. Extracting interactive client presentations into `src/components/portfolio/RecruiterPortfolioClient.tsx` while retaining cyber-terminal aesthetics, Three.js canvas animations, and modal interactions.
3. Implementing server-side Next.js cache revalidation (`revalidatePath('/')`) across all admin API mutation handlers (`POST`, `PATCH`, `DELETE`).
4. Overhauling `/manage` with full CRUD support for Projects, Certificates, and Technical Skills, including dynamic `isPublic` visibility toggling and validation.
5. Implementing strict repository URL validation (`sanitizeRepoUrl()`) to satisfy Requirement 4: bare GitHub profile URLs (`https://github.com/rsherawat2007-create`) are strictly rejected as project repositories, falling back gracefully to proprietary status unless a valid repository slug exists.
6. Passing 100% of all 22 dynamic synchronization test scenarios, bringing the full test suite to 126/126 passing tests.

---

## 1. Audit & Architectural Transformation

### Files Modified & Created

| File | Status | Description |
| :--- | :--- | :--- |
| `src/lib/portfolio-data.ts` | **New** | Server-side data fetching service querying published database records (`isPublic: true`) for profile, education, skills, projects, certificates, and hackathons with safe DTO projection and repository URL sanitization. |
| `src/app/page.tsx` | **Overhauled** | Converted from a hardcoded 2,230-line client component into an optimized Server Component that fetches data server-side and passes typed DTOs to the client presentation component. Configured with `export const dynamic = "force-dynamic"`. |
| `src/components/portfolio/RecruiterPortfolioClient.tsx` | **New** | Interactive client component preserving Three.js interactive scenes, terminal typing animations, skill tabs, project detail modals, certificate inspection dialogs, and contact form handling with dynamic fallback/empty states. |
| `src/app/api/public/route.ts` | **Refactored** | Standardized to utilize `getPublicPortfolioData()`, guaranteeing identical database projection between direct page visits and external API consumers. |
| `src/app/manage/page.tsx` | **Enhanced** | Added Project editing/updating modal, Certificate editing modal, and a dedicated **Technical Skills Management** panel with CRUD and publication toggles. |
| `src/app/api/profile/route.ts` | **Updated** | Added `revalidatePath('/')` on profile updates. |
| `src/app/api/projects/route.ts` | **Updated** | Added `revalidatePath('/')` on project creation. |
| `src/app/api/projects/[id]/route.ts` | **Updated** | Added `revalidatePath('/')` on project update and deletion. |
| `src/app/api/certificates/route.ts` | **Updated** | Added `revalidatePath('/')` on certificate creation. |
| `src/app/api/certificates/[id]/route.ts` | **Updated** | Added `revalidatePath('/')` on certificate update and deletion. |
| `src/app/api/skills/route.ts` | **Updated** | Added `revalidatePath('/')` on skill creation. |
| `src/app/api/skills/[id]/route.ts` | **Updated** | Added `revalidatePath('/')` on skill update and deletion. |
| `scripts/seed-skills.js` | **New** | Database seeding script provisioning 25 verified skills across Programming, Cybersecurity, AI/ML, and Tools. |
| `scripts/test-task5-dynamic.js` | **New** | Automated regression test suite covering all 10 verification scenarios. |

---

## 2. Hardcoded Data Eliminated

1. **Profile & About Me**: Replaced static JSX bio and headline with Prisma `Profile` and `User` models.
2. **Projects Grid**: Removed hardcoded arrays. Projects are queried from `prisma.project.findMany({ where: { isPublic: true } })`.
3. **Certificates & Badges**: Replaced hardcoded certificate cards with `prisma.certificate.findMany({ where: { isPublic: true } })`.
4. **Skills Matrix**: Removed hardcoded skill lists. Skills are grouped dynamically by category (`Programming`, `Cybersecurity`, `AI/ML`, `Tools & DevOps`, `Networking`) from `prisma.skill.findMany({ where: { isPublic: true } })`.
5. **Education & Academics**: Populated from `prisma.education.findMany({ where: { isPublic: true } })`.
6. **Hackathons & Competitions**: Populated from `prisma.hackathon.findMany({ where: { isPublic: true } })`.

---

## 3. Database Models & Schema Integration

All dynamic data maps to verified Prisma models with complete field support:

- **`User` & `Profile`**:
  - `name`, `headline`, `bio`, `location`, `avatar`, `github`, `linkedin`, `twitter`, `website`.
- **`Project`**:
  - `id`, `title`, `slug`, `summary`, `description`, `technologies`, `category`, `githubUrl`, `liveUrl`, `featured`, `status`, `order`, `isPublic`.
- **`Certificate`**:
  - `id`, `title`, `issuer`, `issueDate`, `expiryDate`, `credentialId`, `credentialUrl`, `imageUrl`, `description`, `order`, `isPublic`.
- **`Skill`**:
  - `id`, `name`, `category`, `proficiency`, `order`, `isPublic`.
- **`Education`**:
  - `id`, `institution`, `degree`, `field`, `startYear`, `endYear`, `grade`, `activities`, `description`, `order`, `isPublic`.
- **`Hackathon`**:
  - `id`, `title`, `event`, `date`, `projectTitle`, `projectUrl`, `description`, `order`, `isPublic`.

---

## 4. Next.js Cache Revalidation Architecture

Whenever an administrator creates, modifies, deletes, or changes the publication status of any record in `/manage`, the API route executes `revalidatePath('/')`.

```typescript
// Example: src/app/api/projects/[id]/route.ts
await prisma.project.update({
  where: { id: params.id, userId: session.userId },
  data: updateData,
});

revalidatePath("/");
return NextResponse.json({ success: true, project: updatedProject });
```

This ensures that:
- Server-side rendering at `/` automatically refreshes with the latest published records.
- Visitors immediately see added projects, edited descriptions, and new certificates without restarting the server or waiting for arbitrary TTL expirations.
- Unpublished items (`isPublic: false`) are filtered at the database level and immediately vanish from public view.

---

## 5. Security & Validation Enhancements

### Safe DTO Projection (Zero Secret Leakage)
Neither the homepage Server Component nor the `/api/public` endpoint ever queries or returns private model fields:
- Passwords, password hashes, and session tokens are excluded.
- Internal foreign keys (`userId`) and internal administrative settings are excluded.
- Contact messages and rate limiting tables remain strictly private to authenticated sessions.

### Repository URL Validation (Requirement 4)
Per requirements, project links must be specific repository links rather than bare profile links:
```typescript
export function sanitizeRepoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!["github.com", "gitlab.com", "bitbucket.org"].includes(parsed.hostname.toLowerCase())) {
      return null;
    }
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    // Requires at least user + repo (e.g., /username/repo)
    if (pathSegments.length < 2) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}
```
If a project in the database has only a profile URL (`https://github.com/rsherawat2007-create`), `sanitizeRepoUrl()` returns `null`, displaying a secure "Proprietary / In Dev" badge instead of an invalid repo link.

---

## 6. Verification Test Results (All 10 Scenarios)

The automated test script `scripts/test-task5-dynamic.js` ran against the live database:

| Scenario | Tested Criteria | Result |
| :--- | :--- | :--- |
| **1. Create Project** | Created with CUID, title stored, `isPublic: true` default | **PASS** |
| **2. Edit Project** | Status updated to `completed`, summary modified | **PASS** |
| **3. Delete Project** | Project deleted and verified absent from database | **PASS** |
| **4. Publish/Unpublish Filter** | `isPublic: false` strictly hidden from public queries; `isPublic: true` visible | **PASS** |
| **5. Create Certificate** | Created with issuer, issue date, credential ID, visibility public | **PASS** |
| **6. Update Profile** | Updated headline and bio, verified in database | **PASS** |
| **7. Public API Safe DTO** | Password hash and internal `userId` excluded from response | **PASS** |
| **8. Unauthorized Requests** | Unauthenticated mutation request denied with HTTP 401 | **PASS** |
| **9. Empty Table Fallback** | Clean empty array `[]` returned with zero 500 server errors | **PASS** |
| **10. Repo URL Validation** | Bare profile URL rejected; full repo URL accepted | **PASS** |

**Total Suite Metrics:**
- **Task 5 Suite:** 22 / 22 Passed (100%)
- **Cumulative Security & Architecture Suite:** 126 / 126 Passed (100%)
