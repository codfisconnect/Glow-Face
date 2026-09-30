import nodemailer, { Transporter } from "nodemailer";
import { ENV } from "../../config/env.js";
import { logNotification, checkIdempotency } from "./notificationLogger.js";

let transporter: Transporter | null = null;

if (ENV.SMTP_HOST && ENV.SMTP_USER && ENV.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_SECURE,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS
    }
  });

  // Verify connection asynchronously on startup
  transporter.verify()
    .then(() => console.log("📧 SMTP Email transporter connected and verified."))
    .catch((err: Error) => console.warn("⚠️ SMTP connection verification failed:", err.message));
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  orderId?: string | null;
  eventType?: string;
  idempotencyKey?: string | null;
}

export interface SendEmailResult {
  success: boolean;
  skipped?: boolean;
  messageId?: string;
  error?: string;
  mode?: "LIVE_SMTP" | "DEV_SIMULATION";
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, orderId = null, eventType = "GENERIC", idempotencyKey = null } = options;

  if (!to) {
    console.warn("⚠️ sendEmail called without recipient email address");
    return { success: false, error: "No recipient specified" };
  }

  // Idempotency check: prevent duplicate notifications
  if (idempotencyKey && await checkIdempotency(idempotencyKey)) {
    console.log(`[Notification] Idempotent skip: Email for ${eventType} (key: ${idempotencyKey}) already processed.`);
    return { success: true, skipped: true, mode: "DEV_SIMULATION" };
  }

  // 1. Live SMTP Dispatch
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: ENV.EMAIL_FROM,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, " ")
      });

      await logNotification({
        orderId,
        idempotencyKey,
        recipient: to,
        channel: "EMAIL",
        eventType,
        status: "SENT",
        metadata: { messageId: info.messageId, response: info.response }
      });

      return { success: true, messageId: info.messageId, mode: "LIVE_SMTP" };
    } catch (err: any) {
      console.error(`❌ SMTP delivery failed to ${to}:`, err.message);
      await logNotification({
        orderId,
        idempotencyKey,
        recipient: to,
        channel: "EMAIL",
        eventType,
        status: "FAILED",
        error: err.message
      });
      return { success: false, error: err.message };
    }
  }

  // 2. Production with missing credentials -> Log FAILED
  if (ENV.NODE_ENV === "production") {
    const errorMsg = "SMTP provider credentials not configured in production environment.";
    console.error(`❌ [Production] Cannot send email to ${to}: ${errorMsg}`);
    await logNotification({
      orderId,
      idempotencyKey,
      recipient: to,
      channel: "EMAIL",
      eventType,
      status: "FAILED",
      error: errorMsg
    });
    return { success: false, error: errorMsg };
  }

  // 3. Development Mode Simulation -> Log SIMULATED
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    channel: "EMAIL",
    status: "SIMULATED",
    to,
    subject,
    eventType
  }));

  await logNotification({
    orderId,
    idempotencyKey,
    recipient: to,
    channel: "EMAIL",
    eventType,
    status: "SIMULATED",
    metadata: { note: "Local dev simulation. Provide SMTP credentials in .env to activate live dispatch." }
  });

  return { success: true, mode: "DEV_SIMULATION" };
}

export async function verifyEmailDiagnostics(): Promise<{ configured: boolean; verified: boolean; host?: string; error?: string }> {
  if (!transporter) {
    return { configured: false, verified: false, error: "SMTP credentials not provided in environment." };
  }
  try {
    await transporter.verify();
    return { configured: true, verified: true, host: ENV.SMTP_HOST };
  } catch (err: any) {
    return { configured: true, verified: false, host: ENV.SMTP_HOST, error: err.message };
  }
}
