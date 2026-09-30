import { Order, Product } from "../../types/index.js";
import { getDatabase } from "../../config/database.js";
import { ENV } from "../../config/env.js";
import { sendEmail } from "./emailService.js";
import { sendWhatsAppMessage } from "./whatsappService.js";
import { NotificationTemplates } from "./notificationTemplates.js";

// Debounce set to prevent duplicate low-stock alerts within 24 hours
const lowStockAlerted = new Set<string>();

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
   * Dispatches ORDER_CONFIRMED notifications (Non-blocking)
   */
  notifyOrderConfirmed(order: Order): void {
    Promise.resolve().then(async () => {
      // 1. Customer Email
      const emailContent = NotificationTemplates.orderConfirmedEmail(order);
      await sendEmail({
        to: order.customerEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        orderId: order.id,
        eventType: "ORDER_CONFIRMED"
      });

      // 2. Customer WhatsApp
      const waText = NotificationTemplates.orderConfirmedWhatsApp(order);
      await sendWhatsAppMessage({
        to: order.customerPhone,
        message: waText,
        orderId: order.id,
        eventType: "ORDER_CONFIRMED"
      });

      // 3. Admin In-App Alert
      await this.createAdminNotification(
        "New Prepaid Order",
        `Order #${order.orderNumber} received for ₹${order.totalAmount} from ${order.customerName}`,
        "ORDER",
        `/admin/orders/${order.id}`
      );
    }).catch(err => console.error("Async notification dispatch error (ORDER_CONFIRMED):", err));
  }

  /**
   * Dispatches ORDER_SHIPPED notifications (Non-blocking)
   */
  notifyOrderShipped(order: Order): void {
    Promise.resolve().then(async () => {
      const emailContent = NotificationTemplates.orderShippedEmail(order);
      await sendEmail({
        to: order.customerEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        orderId: order.id,
        eventType: "ORDER_SHIPPED"
      });

      const waText = NotificationTemplates.orderShippedWhatsApp(order);
      await sendWhatsAppMessage({
        to: order.customerPhone,
        message: waText,
        orderId: order.id,
        eventType: "ORDER_SHIPPED"
      });
    }).catch(err => console.error("Async notification dispatch error (ORDER_SHIPPED):", err));
  }

  /**
   * Dispatches OUT_FOR_DELIVERY notifications (Non-blocking)
   */
  notifyOutForDelivery(order: Order): void {
    Promise.resolve().then(async () => {
      const waText = NotificationTemplates.outForDeliveryWhatsApp(order);
      await sendWhatsAppMessage({
        to: order.customerPhone,
        message: waText,
        orderId: order.id,
        eventType: "OUT_FOR_DELIVERY"
      });
    }).catch(err => console.error("Async notification dispatch error (OUT_FOR_DELIVERY):", err));
  }

  /**
   * Dispatches ORDER_DELIVERED notifications (Non-blocking)
   */
  notifyOrderDelivered(order: Order): void {
    Promise.resolve().then(async () => {
      const waText = NotificationTemplates.orderDeliveredWhatsApp(order);
      await sendWhatsAppMessage({
        to: order.customerPhone,
        message: waText,
        orderId: order.id,
        eventType: "ORDER_DELIVERED"
      });
    }).catch(err => console.error("Async notification dispatch error (ORDER_DELIVERED):", err));
  }

  /**
   * Dispatches PAYMENT_FAILED notification (Non-blocking)
   */
  notifyPaymentFailed(order: Order): void {
    Promise.resolve().then(async () => {
      const waText = NotificationTemplates.paymentFailedWhatsApp(order);
      await sendWhatsAppMessage({
        to: order.customerPhone,
        message: waText,
        orderId: order.id,
        eventType: "PAYMENT_FAILED"
      });

      await this.createAdminNotification(
        "Payment Failed",
        `Payment failed for Order #${order.orderNumber} (${order.customerName})`,
        "PAYMENT",
        `/admin/orders/${order.id}`
      );
    }).catch(err => console.error("Async notification dispatch error (PAYMENT_FAILED):", err));
  }

  /**
   * Dispatches ORDER_CANCELLED notification (Non-blocking)
   */
  notifyOrderCancelled(order: Order): void {
    Promise.resolve().then(async () => {
      const waText = NotificationTemplates.orderCancelledWhatsApp(order);
      await sendWhatsAppMessage({
        to: order.customerPhone,
        message: waText,
        orderId: order.id,
        eventType: "ORDER_CANCELLED"
      });

      await this.createAdminNotification(
        "Order Cancelled",
        `Order #${order.orderNumber} was marked cancelled`,
        "ORDER",
        `/admin/orders/${order.id}`
      );
    }).catch(err => console.error("Async notification dispatch error (ORDER_CANCELLED):", err));
  }

  /**
   * Dispatches LOW_STOCK alert with duplicate suppression (Rule #15)
   */
  notifyLowStock(product: { id: string; name: string; sku?: string | null; stock: number; lowStockThreshold: number }): void {
    if (lowStockAlerted.has(product.id)) {
      return; // Suppress duplicate alert within current runtime session
    }
    lowStockAlerted.add(product.id);

    Promise.resolve().then(async () => {
      // 1. Admin Email
      const emailContent = NotificationTemplates.adminLowStockEmail(product);
      await sendEmail({
        to: ENV.ADMIN_NOTIFICATION_EMAIL,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        eventType: "LOW_STOCK"
      });

      // 2. In-App Notification Center
      await this.createAdminNotification(
        "Low Stock Warning",
        `Product '${product.name}' has reached low stock threshold (${product.stock} units left).`,
        "INVENTORY",
        "/admin/inventory"
      );
    }).catch(err => console.error("Async low stock notification error:", err));
  }

  /**
   * Clear low-stock debounce when product is restocked
   */
  resetLowStockAlert(productId: string): void {
    lowStockAlerted.delete(productId);
  }
}

export const notificationService = new NotificationService();
