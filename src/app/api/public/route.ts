import { ok, serverError } from "@/lib/api";
import { getPublicPortfolioData } from "@/lib/portfolio-data";

export const dynamic = "force-dynamic";

/**
 * Public Recruiter Portfolio API Endpoint:
 * Returns strictly curated, non-sensitive, public-facing information for recruiters.
 *
 * Security Controls:
 * - Explicit Prisma field selections (DTOs) for all models.
 * - Zero exposure of:
 *   - User IDs or database foreign keys (cuid/uuid)
 *   - Authentication credentials or password hashes
 *   - Private userSettings (e.g. Gemini API keys, internal preferences)
 *   - Internal administrative notes or unverified/unpublished records
 *   - Contact messages or session tokens
 */
export async function GET() {
  try {
    const data = await getPublicPortfolioData();
    return ok(data);
  } catch (e) {
    return serverError(e);
  }
}
