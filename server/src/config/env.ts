import dotenv from "dotenv";
dotenv.config();

export interface Environment {
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
  CLIENT_URL: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;
  ADMIN_NOTIFICATION_EMAIL: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  WHATSAPP_ACCESS_TOKEN: string;
  WHATSAPP_BUSINESS_ACCOUNT_ID: string;
  INSTAGRAM_ACCOUNT_ID: string;
  INSTAGRAM_ACCESS_TOKEN: string;
  INSTAGRAM_HANDLE: string;
}

export const ENV: Environment = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: (process.env.NODE_ENV as any) || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "glow_face_dev_jwt_secret_change_in_production_12345"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_SECURE: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "Glow Face Skincare <care@glowface.in>",
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || "admin@glowface.in",

  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || "",
  WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",

  INSTAGRAM_ACCOUNT_ID: process.env.INSTAGRAM_ACCOUNT_ID || "",
  INSTAGRAM_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN || "",
  INSTAGRAM_HANDLE: process.env.INSTAGRAM_HANDLE || "glowface_official"
};

// Fail fast in production if critical secrets are missing
if (ENV.NODE_ENV === "production") {
  if (!ENV.JWT_SECRET || ENV.JWT_SECRET.length < 16) {
    console.error("FATAL: JWT_SECRET must be set and at least 16 characters in production.");
  }
}
