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
      log: ENV.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
    });
  } catch (err: any) {
    console.error("Error initializing PrismaClient:", err.message);
  }
} else {
  if (ENV.NODE_ENV === "production") {
    console.error(
      "CRITICAL: DATABASE_URL not set in PRODUCTION environment!"
    );
  } else {
    console.log(
      "Development mode: Running with in-memory DevStore."
    );
  }
}

export type DatabaseProvider =
  | { type: "prisma"; db: PrismaClient }
  | { type: "devStore"; db: typeof devStore };

export function getDatabase(): DatabaseProvider {
  if (ENV.NODE_ENV === "production") {
    if (!prisma) {
      throw new HttpError(
        503,
        "Database service unavailable. PostgreSQL configuration is missing."
      );
    }

    return {
      type: "prisma",
      db: prisma,
    };
  }

  if (prisma) {
    return {
      type: "prisma",
      db: prisma,
    };
  }

  return {
    type: "devStore",
    db: devStore,
  };
}

export { prisma, devStore };