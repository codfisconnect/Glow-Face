import readline from "readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { ENV } from "../config/env.js";

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function createAdmin() {
  console.log("============================================================");
  console.log("       GLOW FACE — SECURE ADMIN PROVISIONING UTILITY        ");
  console.log("============================================================");

  const args = process.argv.slice(2);
  let email = process.env.ADMIN_EMAIL || "";
  let password = process.env.ADMIN_PASSWORD || "";
  let name = process.env.ADMIN_NAME || "Store Administrator";

  // Parse flags or positional args
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if ((a === "--email" || a === "-e") && args[i + 1]) {
      email = args[++i]!;
    } else if ((a === "--password" || a === "-p") && args[i + 1]) {
      password = args[++i]!;
    } else if ((a === "--name" || a === "-n") && args[i + 1]) {
      name = args[++i]!;
    } else if (!email && a.includes("@")) {
      email = a;
    } else if (email && !password && !a.startsWith("-")) {
      password = a;
    }
  }

  if (!email) {
    email = await prompt("Enter Admin Email: ");
  }

  if (!email || !email.includes("@")) {
    console.error("❌ Error: A valid email address is required.");
    process.exit(1);
  }

  if (!password) {
    password = await prompt("Enter Secure Admin Password (min 8 characters): ");
  }

  if (!password || password.length < 8) {
    console.error("❌ Error: Admin password must be at least 8 characters long.");
    process.exit(1);
  }

  const cleanEmail = email.toLowerCase().trim();
  console.log(`\n🔒 Hashing password with bcrypt (12 rounds)...`);
  const passwordHash = await bcrypt.hash(password, 12);

  const prisma = new PrismaClient();
  try {
    console.log(`Connecting to database...`);
    await prisma.$connect();

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (existing) {
      await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          passwordHash,
          role: "ADMIN",
          name: name || existing.name
        }
      });
      console.log(`✅ Success: Existing account for '${cleanEmail}' updated to ADMIN with new secure password.`);
    } else {
      await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: "ADMIN",
          name
        }
      });
      console.log(`✅ Success: New ADMIN account created for '${cleanEmail}'.`);
    }

    console.log("🔐 Credentials securely provisioned. No plain-text passwords stored.");
  } catch (err: any) {
    console.error("❌ Database operation failed:", err.message);
    if (!ENV.DATABASE_URL) {
      console.warn("ℹ️ Notice: DATABASE_URL is not set in environment.");
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
