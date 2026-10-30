const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Load .env.local or .env if present
function loadEnv() {
  const envPaths = [
    path.join(__dirname, "..", ".env.local"),
    path.join(__dirname, "..", ".env"),
  ];

  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eq = trimmed.indexOf("=");
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  }
}

loadEnv();

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "rsherawat2007@gmail.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "PortfolioAdmin#2026!";

  if (!password || password.length < 8) {
    console.error("Error: ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  console.log(`Provisioning administrator for email: ${email}...`);
  const hashedPassword = await bcrypt.hash(password, 12);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });
    console.log(`✓ Admin user password updated successfully for: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            fullName: "Rahul Sehrawat",
            email,
          },
        },
        userSettings: {
          create: {},
        },
      },
    });
    console.log(`✓ New admin user created successfully for: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error("Provisioning error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
