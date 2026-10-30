import { getPublicPortfolioData } from "@/lib/portfolio-data";
import { RecruiterPortfolioClient } from "@/components/portfolio/RecruiterPortfolioClient";

// Ensure fresh dynamic rendering with on-demand cache revalidation
export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getPublicPortfolioData();
  return <RecruiterPortfolioClient initialData={data} />;
}
