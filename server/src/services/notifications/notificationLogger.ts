import { getDatabase } from "../../config/database.js";
import { NotificationChannel, NotificationStatus, NotificationLogRecord } from "../../types/index.js";

export interface LogNotificationParams {
  orderId?: string | null;
  idempotencyKey?: string | null;
  recipient: string;
  channel: NotificationChannel;
  eventType: string;
  status?: NotificationStatus;
  attempts?: number;
  error?: string | null;
  metadata?: any;
}

export async function checkIdempotency(idempotencyKey: string): Promise<boolean> {
  if (!idempotencyKey) return false;
  const { type, db } = getDatabase();

  try {
    if (type === "prisma") {
      const existing = await (db.notificationLog as any).findFirst({
        where: {
          idempotencyKey,
          status: { in: ["SENT", "SIMULATED"] }
        }
      });
      return Boolean(existing);
    } else {
      const found = db.notificationLogs.find(
        l => l.idempotencyKey === idempotencyKey && (l.status === "SENT" || l.status === "SIMULATED")
      );
      return Boolean(found);
    }
  } catch {
    return false;
  }
}

export async function logNotification(params: LogNotificationParams): Promise<NotificationLogRecord | null> {
  const { type, db } = getDatabase();

  const record: NotificationLogRecord = {
    id: `notif_log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    orderId: params.orderId || null,
    idempotencyKey: params.idempotencyKey || null,
    recipient: params.recipient,
    channel: params.channel,
    eventType: params.eventType,
    status: params.status || "PENDING",
    attempts: params.attempts || 1,
    error: params.error || null,
    metadata: params.metadata ? (typeof params.metadata === "string" ? params.metadata : JSON.stringify(params.metadata)) : null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    if (type === "prisma") {
      const created = await db.notificationLog.create({
        data: {
          id: record.id,
          orderId: record.orderId,
          recipient: record.recipient,
          channel: record.channel,
          eventType: record.eventType,
          status: record.status,
          attempts: record.attempts,
          error: record.error,
          metadata: record.metadata
        }
      });
      return {
        ...created,
        idempotencyKey: record.idempotencyKey,
        channel: created.channel as NotificationChannel,
        status: created.status as NotificationStatus
      };
    } else {
      db.notificationLogs.unshift(record);
      return record;
    }
  } catch (err: any) {
    console.warn("⚠️ Could not write to notification log table:", err.message);
    return null;
  }
}

export async function getNotificationLogs(orderId?: string): Promise<NotificationLogRecord[]> {
  const { type, db } = getDatabase();
  try {
    if (type === "prisma") {
      const logs = await db.notificationLog.findMany({
        where: orderId ? { orderId } : undefined,
        orderBy: { createdAt: "desc" },
        take: 100
      });
      return logs.map(l => ({
        ...l,
        channel: l.channel as NotificationChannel,
        status: l.status as NotificationStatus
      }));
    } else {
      if (orderId) {
        return db.notificationLogs.filter(l => l.orderId === orderId);
      }
      return db.notificationLogs.slice(0, 100);
    }
  } catch (err: any) {
    console.warn("⚠️ Could not retrieve notification logs:", err.message);
    return [];
  }
}
