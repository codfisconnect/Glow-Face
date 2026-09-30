import { PrismaClient } from "@prisma/client";
import { ENV } from "./env.js";
import { devStore } from "./devStore.js";
import { HttpError } from "../middleware/errorHandler.js";

let prisma: PrismaClient | null = null;
let isPrismaConnected = false;

if (ENV.DATABASE_URL && ENV.DATABASE_URL.startsWith("postgres")) {
  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: ENV.DATABASE_URL
        }
      },
      log: ENV.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
    });

    prisma.$connect()
      .then(() => {
        isPrismaConnected = true;
        console.log("✅ PostgreSQL connected successfully via Prisma.");
      })
      .catch((err: Error) => {
        isPrismaConnected = false;
        console.error("❌ PostgreSQL connection failed:", err.message);
        if (ENV.NODE_ENV === "production") {
          console.error("🚨 CRITICAL: Running in PRODUCTION without connected PostgreSQL! Requests will reject to protect data integrity.");
        } else {
          console.warn("⚠️ Development mode: Using local in-memory DevStore.");
        }
      });
  } catch (err: any) {
    console.error("❌ Error initializing PrismaClient:", err.message);
  }
} else {
  if (ENV.NODE_ENV === "production") {
    console.error("🚨 CRITICAL: DATABASE_URL not set in PRODUCTION environment!");
  } else {
    console.log("ℹ️ Development mode: Running with in-memory DevStore.");
  }
}

export type DatabaseProvider = 
  | { type: "prisma"; db: PrismaClient }
  | { type: "devStore"; db: typeof devStore };

export function getDatabase(): DatabaseProvider {
  if (isPrismaConnected && prisma) {
    return { type: "prisma", db: prisma };
  }

  // PRODUCTION SAFETY RULE: NEVER silently switch to in-memory DevStore in production!
  if (ENV.NODE_ENV === "production") {
    throw new HttpError(
      503,
      "Database service unavailable. Persistent PostgreSQL connection required in production."
    );
  }

  return { type: "devStore", db: devStore };
}

export { prisma, devStore };
