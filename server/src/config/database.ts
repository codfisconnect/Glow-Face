import { PrismaClient } from "@prisma/client";
import { ENV } from "./env.js";
import { devStore } from "./devStore.js";
import { HttpError } from "../middleware/errorHandler.js";

let prisma: PrismaClient | null = null;

if (ENV.DATABASE_URL && ENV.DATABASE_URL.startsWith("postgres")) {
  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: ENV.DATABASE_URL,
        },
      },
      log: ENV.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

    // Prisma connects lazily on the first database query.
    // Do not depend on an asynchronous module-level $connect()
    // for Vercel serverless functions.
    prisma.$connect().catch((err: Error) => {
      console.error("❌ PostgreSQL connection failed:", err.message);
    });
  } catch (err: any) {
    console.error("❌ Error initializing PrismaClient:", err.message);
  }
} else {
  if (ENV.NODE_ENV === "production") {
    console.error(
      "🚨 CRITICAL: DATABASE_URL not set in PRODUCTION environment!"
    );
  } else {
    console.log("ℹ️ Development mode: Running with in-memory DevStore.");
  }
}

export type DatabaseProvider =
  | { type: "prisma"; db: PrismaClient }
  | { type: "devStore"; db: typeof devStore };

export function getDatabase(): DatabaseProvider {
  // In production, if Prisma was initialized with a PostgreSQL URL,
  // return it immediately. Prisma itself handles the database
  // connection when the first query executes.
  if (ENV.NODE_ENV === "production") {
    if (prisma) {
      return { type: "prisma", db: prisma };
    }

    throw new HttpError(
      503,
      "Database service unavailable. PostgreSQL configuration is missing."
    );
  }

  if (prisma) {
    return { type: "prisma", db: prisma };
  }

  return { type: "devStore", db: devStore };
}

export { prisma, devStore };