import { prisma } from "@/lib/prisma";

/**
 * Recruiter & Owner Portfolio Mode:
 * No login system, no authentication walls, no session passwords.
 * Automatically resolves the portfolio owner user so data APIs work seamlessly.
 */
export async function requireAuth() {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "owner@portfolio.local",
          password: "portfolio_owner_nopassword",
          profile: { create: { fullName: "Rahul Sehrawat" } },
          userSettings: { create: {} },
        },
      });
    }
    return { id: user.id, email: user.email };
  } catch {
    return { id: "default_owner", email: "owner@portfolio.local" };
  }
}

export async function getSession() {
  const user = await requireAuth();
  return {
    user,
    destroy: () => {},
    save: async () => {},
  };
}
