// Rulează cu: node scripts/reset-admin.mjs
// Resetează parola adminului sau creează unul nou.

import bcrypt from "bcryptjs";
import { createRequire } from "module";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Citește DATABASE_URL din .env.local
function loadEnv() {
  try {
    const env = readFileSync(join(__dirname, "../.env.local"), "utf8");
    for (const line of env.split("\n")) {
      const [k, ...v] = line.split("=");
      if (k?.trim() && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join("=").replace(/^"|"$/g, "").trim();
      }
    }
  } catch {}
}

loadEnv();

const NEW_EMAIL    = "admin@replacedbyai.ro";
const NEW_PASSWORD = "RbAi2026!Admin";

async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const hash = await bcrypt.hash(NEW_PASSWORD, 10);

  const existing = await prisma.adminUser.findUnique({ where: { email: NEW_EMAIL } });

  if (existing) {
    await prisma.adminUser.update({
      where: { email: NEW_EMAIL },
      data: { passwordHash: hash },
    });
    console.log("✅ Parola resetată pentru:", NEW_EMAIL);
  } else {
    const count = await prisma.adminUser.count();
    await prisma.adminUser.create({
      data: { email: NEW_EMAIL, passwordHash: hash, name: "Owner", role: count === 0 ? "OWNER" : "ADMIN" },
    });
    console.log("✅ Admin creat:", NEW_EMAIL);
  }

  console.log("📧 Email:", NEW_EMAIL);
  console.log("🔑 Parolă:", NEW_PASSWORD);
  console.log("\nPoti intra acum pe /login cu aceste date.");

  await prisma.$disconnect();
}

main().catch((e) => { console.error("❌ Eroare:", e.message); process.exit(1); });
