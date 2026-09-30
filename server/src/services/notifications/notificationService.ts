import { Order } from "../../types/index.js";
import { getDatabase } from "../../config/database.js";
import { ENV } from "../../config/env.js";
import { sendEmail } from "./emailService.js";
import { sendWhatsAppMessage } from "./whatsappService.js";
import { NotificationTemplates } from "./notificationTemplates.js";

// Debounce set to prevent duplicate low-stock alerts within runtime session
const lowStockAlerted = new Set<string>();

export type NotificationEventType =
  | "ORDER_PLACED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "ORDER_CANCELLED"
  | "ORDER_PROCESSING"
  | "ORDER_PACKED"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "LOW_STOCK";

export class NotificationService {
  /**
   * Helper to insert in-app Admin Notification
   */
  async createAdminNotification(title: string, message: string, type: string, link?: string): Promise<void> {
    const { type: dbType, db } = getDatabase();
    try {
      if (dbType === "prisma") {
        await db.adminNotification.create({
          data: { title, message, type, link: link || null }
        });
      } else {
        db.adminNotifications.unshift({
          id: `notif_${Date.now()}`,
          title,
          message,
          type,
          read: false,
          link: link || null,
          createdAt: new Date()
        });
      }
    } catch (err: any) {
      console.warn("⚠️ Could not save admin notification:", err.message);
    }
  }

  /**
   * Unified, failure-safe, idempotent event dispatcher.
   * Guaranteed NEVER to throw or fail the caller.
   */
  async dispatchEvent(eventType: NotificationEventType, order: Order): Promise<{ emailSent: boolean; waSent: boolean; emailSkipped?: boolean; waSkipped?: boolean }> {
    const emailKey = `${order.id}_${eventType}_EMAIL`;
    const waKey = `${order.id}_${eventType}_WHATSAPP`;

    let emailSent = false;
    let waSent = false;
    let emailSkipped = false;
    let waSkipped = false;

    try {
      // 1. Resolve template content based on event type
      let emailTemplate: { subject: string; html: string; text: string } | null = null;
      let waMessage: string | null = null;

      switch (eventType) {
        case "ORDER_PLACED":
          emailTemplate = NotificationTemplates.orderPlacedEmail(order);
          waMessage = NotificationTemplates.orderPlacedWhatsApp(order);
          break;
        case "PAYMENT_SUCCESS":
          emailTemplate = NotificationTemplates.orderConfirmedEmail(order);
          waMessage = NotificationTemplates.orderConfirmedWhatsApp(order);
          break;
        case "ORDER_PROCESSING":
          emailTemplate = NotificationTemplates.orderProcessingEmail(order);
          waMessage = NotificationTemplates.orderProcessingWhatsApp(order);
          break;
        case "ORDER_PACKED":
          emailTemplate = NotificationTemplates.orderPackedEmail(order);
          waMessage = NotificationTemplates.orderPackedWhatsApp(order);
          break;
        case "ORDER_SHIPPED":
          emailTemplate = NotificationTemplates.orderShippedEmail(order);
          waMessage = NotificationTemplates.orderShippedWhatsApp(order);
          break;
        case "ORDER_DELIVERED":
          emailTemplate = NotificationTemplates.orderDeliveredEmail(order);
          waMessage = NotificationTemplates.orderDeliveredWhatsApp(order);
          break;
        case "PAYMENT_FAILED":
          emailTemplate = NotificationTemplates.paymentFailedEmail(order);
          waMessage = NotificationTemplates.paymentFailedWhatsApp(order);
          break;
        case "ORDER_CANCELLED":
          emailTemplate = NotificationTemplates.orderCancelledEmail(order);
          waMessage = NotificationTemplates.orderCancelledWhatsApp(order);
          break;
        default:
          break;
      }

      // 2. Dispatch Email (safe)
      if (emailTemplate && order.customerEmail) {
        try {
          const res = await sendEmail({
            to: order.customerEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
            orderId: order.id,
            eventType,
            idempotencyKey: emailKey
          });
          emailSent = res.success && !res.skipped;
          emailSkipped = Boolean(res.skipped);
        } catch (err: any) {
          console.warn(`[Notification] Email failed for ${eventType}:`, err.message);
        }
      }

      // 3. Dispatch WhatsApp (safe)
      if (waMessage && order.customerPhone) {
        try {
          const res = await sendWhatsAppMessage({
            to: order.customerPhone,
            message: waMessage,
            orderId: order.id,
            eventType,
            idempotencyKey: waKey
          });
          waSent = res.success && !res.skipped;
          waSkipped = Boolean(res.skipped);
        } catch (err: any) {
          console.warn(`[Notification] WhatsApp failed for ${eventType}:`, err.message);
        }
      }

      // 4. In-App Admin Notification Trigger
      if (eventType === "PAYMENT_SUCCESS") {
        await this.createAdminNotification(
          "New Prepaid Order",
          `Order #${order.orderNumber} received for ₹${order.totalAmount} from ${order.customerName}`,
          "ORDER",
          `/admin/orders/${order.id}`
        );
      } else if (eventType === "PAYMENT_FAILED") {
        await this.createAdminNotification(
          "Payment Failed",
          `Payment failed for Order #${order.orderNumber} (${order.customerName})`,
          "PAYMENT",
          `/admin/orders/${order.id}`
        );
      } else if (eventType === "ORDER_CANCELLED") {
        await this.createAdminNotification(
          "Order Cancelled",
          `Order #${order.orderNumber} was marked cancelled`,
          "ORDER",
          `/admin/orders/${order.id}`
        );
      }
    } catch (err: any) {
      console.error(`[Notification] Unexpected error in dispatchEvent (${eventType}):`, err.message);
    }

    return { emailSent, waSent, emailSkipped, waSkipped };
  }

  // Backward-compatible individual dispatch wrappers
  notifyOrderConfirmed(order: Order): void {
    Promise.resolve().then(() => this.dispatchEvent("PAYMENT_SUCCESS", order)).catch(() => {});
  }

  notifyPaymentSuccess(order: Order): void {
    Promise.resolve().then(() => this.dispatchEvent("PAYMENT_SUCCESS", order)).catch(() => {});
  }

  notifyOrderPlaced(order: Order): void {
    Promise.resolve().then(() => this.dispatchEvent("ORDER_PLACED", order)).catch(() => {});
  }

  notifyOrderProcessing(order: Order): void {
    Promise.resolve().then(() => this.dispatchEvent("ORDER_PROCESSING", order)).catch(() => {});
  }

  notifyOrderPacked(order: Order): void {
    Promise.resolve().then(() => this.dispatchEvent("ORDER_PACKED", order)).catch(() => {});
  }

  notifyOrderShipped(order: Order): void {
    Promise.resolve().then(() => this.dispatchEvent("ORDER_SHIPPED", order)).catch(() => {});
  }

  notifyOrderDelivered(order: Order): void {
    Promise.resolve().then(() => this.dispatchEvent("ORDER_DELIVERED", order)).catch(() => {});
  }

  notifyPaymentFailed(order: Order): void {
    Promise.resolve().then(() => this.dispatchEvent("PAYMENT_FAILED", order)).catch(() => {});
  }

  notifyOrderCancelled(order: Order): void {
    Promise.resolve().then(() => this.dispatchEvent("ORDER_CANCELLED", order)).catch(() => {});
  }

  notifyOutForDelivery(order: Order): void {
    Promise.resolve().then(async () => {
      const waText = NotificationTemplates.outForDeliveryWhatsApp(order);
      await sendWhatsAppMessage({
        to: order.customerPhone,
        message: waText,
        orderId: order.id,
        eventType: "OUT_FOR_DELIVERY",
        idempotencyKey: `${order.id}_OUT_FOR_DELIVERY_WHATSAPP`
      });
    }).catch(() => {});
  }

  /**
   * Dispatches LOW_STOCK alert with duplicate suppression
   */
  notifyLowStock(product: { id: string; name: string; sku?: string | null; stock: number; lowStockThreshold: number }): void {
    if (lowStockAlerted.has(product.id)) {
      return;
    }
    lowStockAlerted.add(product.id);

    Promise.resolve().then(async () => {
      const emailContent = NotificationTemplates.adminLowStockEmail(product);
      await sendEmail({
        to: ENV.ADMIN_NOTIFICATION_EMAIL,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        eventType: "LOW_STOCK",
        idempotencyKey: `low_stock_${product.id}_${new Date().toISOString().substring(0, 10)}`
      });

      await this.createAdminNotification(
        "Low Stock Warning",
        `Product '${product.name}' has reached low stock threshold (${product.stock} units left).`,
        "INVENTORY",
        "/admin/inventory"
      );
    }).catch(err => console.error("Async low stock notification error:", err));
  }

  resetLowStockAlert(productId: string): void {
    lowStockAlerted.delete(productId);
  }
}

export const notificationService = new NotificationService();
