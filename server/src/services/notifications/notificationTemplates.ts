import { Order } from "../../types/index.js";

function getAddressObject(shippingAddress: any): any {
  if (typeof shippingAddress === "string") {
    try {
      return JSON.parse(shippingAddress || "{}");
    } catch {
      return {};
    }
  }
  return shippingAddress || {};
}

function renderItemsHtml(order: Order): string {
  return (order.items || [])
    .map(
      it => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 12px 0;">
        <strong style="color: #123C2A;">${it.productName}</strong><br/>
        <span style="color: #64748b; font-size: 13px;">Qty: ${it.quantity} × ₹${it.unitPrice}</span>
      </td>
      <td style="padding: 12px 0; text-align: right; color: #123C2A; font-weight: 600;">
        ₹${it.subtotal}
      </td>
    </tr>`
    )
    .join("");
}

export const NotificationTemplates = {
  // 1. ORDER_PLACED (When order is initialized before payment)
  orderPlacedEmail(order: Order): { subject: string; html: string; text: string } {
    const itemsListHtml = renderItemsHtml(order);
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: sans-serif; background-color: #FAFAF7; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #EAEAE4;">
        <div style="background: #123C2A; padding: 28px 24px; text-align: center;">
          <h1 style="color: #FFFDF9; margin: 0; font-size: 24px; letter-spacing: 0.08em;">GLOW FACE</h1>
          <p style="color: #D4AF37; margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase;">Botanical Skincare Essentials</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #123C2A; font-size: 20px; margin-top: 0;">Order Received</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Hello <strong>${order.customerName}</strong>, your order <strong>#${order.orderNumber}</strong> has been received and is awaiting payment confirmation.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tbody>${itemsListHtml}</tbody>
          </table>
          <p style="color: #123C2A; font-weight: 600;">Order Total: ₹${order.totalAmount}</p>
        </div>
      </div>
    </body>
    </html>`;
    const text = `Order Received: #${order.orderNumber}. Hello ${order.customerName}, your Glow Face order has been created. Total: ₹${order.totalAmount}.`;
    return { subject: `Order Received: #${order.orderNumber} - Glow Face Skincare`, html, text };
  },

  orderPlacedWhatsApp(order: Order): string {
    return `🌿 *Glow Face Skincare* — Order Received!\n\nHello ${order.customerName},\nYour Order *#${order.orderNumber}* for *₹${order.totalAmount}* has been received and is awaiting payment confirmation.`;
  },

  // 2. PAYMENT_SUCCESS / ORDER_CONFIRMED
  orderConfirmedEmail(order: Order): { subject: string; html: string; text: string } {
    const itemsListHtml = renderItemsHtml(order);
    const address = getAddressObject(order.shippingAddress);

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAF7; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #EAEAE4;">
        <div style="background: #123C2A; padding: 32px 24px; text-align: center;">
          <h1 style="color: #FFFDF9; margin: 0; font-size: 24px; letter-spacing: 0.1em; font-weight: 700;">GLOW FACE</h1>
          <p style="color: #D4AF37; margin: 6px 0 0 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Botanical Skincare Essentials</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #123C2A; font-size: 20px; margin-top: 0;">Payment Verified & Order Confirmed! ✨</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Thank you for choosing Glow Face, <strong>${order.customerName}</strong>! Your payment has been safely verified and our fulfillment team is preparing your order.
          </p>

          <div style="background: #F4F6F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #123C2A;"><strong>Order ID:</strong> #${order.orderNumber}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #123C2A; color: #123C2A; font-size: 12px; text-transform: uppercase;">
                <th style="text-align: left; padding-bottom: 8px;">Product</th>
                <th style="text-align: right; padding-bottom: 8px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsListHtml}</tbody>
            <tfoot>
              <tr>
                <td style="padding-top: 16px; color: #64748b;">Subtotal</td>
                <td style="padding-top: 16px; text-align: right; color: #123C2A; font-weight: 600;">₹${order.subtotal}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Shipping</td>
                <td style="padding: 6px 0; text-align: right; color: #059669; font-weight: 600;">${order.shippingAmount === 0 ? "FREE" : `₹${order.shippingAmount}`}</td>
              </tr>
              ${order.discountAmount > 0 ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Promotional Discount (${order.couponCode || "Coupon"})</td>
                <td style="padding: 6px 0; text-align: right; color: #D4AF37; font-weight: 600;">-₹${order.discountAmount}</td>
              </tr>` : ""}
              <tr style="border-top: 2px solid #EAEAE4; font-size: 16px;">
                <td style="padding-top: 12px; color: #123C2A; font-weight: 700;">Grand Total Paid</td>
                <td style="padding-top: 12px; text-align: right; color: #123C2A; font-weight: 700;">₹${order.totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          <div style="border-top: 1px solid #EAEAE4; padding-top: 16px; color: #475569; font-size: 14px;">
            <strong style="color: #123C2A;">Shipping Address:</strong><br/>
            ${address.address || ""}, ${address.city || ""}, ${address.state || ""} - ${address.pin || ""}<br/>
            Contact: ${order.customerPhone}
          </div>
        </div>
      </div>
    </body>
    </html>`;

    const text = `Glow Face Order Confirmed (#${order.orderNumber}). Thank you, ${order.customerName}! We received your payment of ₹${order.totalAmount}. Your skincare essentials are being prepared for dispatch.`;
    return { subject: `Order Confirmed: #${order.orderNumber} - Glow Face Skincare`, html, text };
  },

  orderConfirmedWhatsApp(order: Order): string {
    return `🌿 *Glow Face Skincare* — Order Confirmed! ✨\n\nHello ${order.customerName},\nThank you for choosing Glow Face. Your payment of *₹${order.totalAmount}* for Order *#${order.orderNumber}* has been verified.\n\nOur fulfillment center is preparing your order. We will notify you once your package is dispatched!`;
  },

  // 3. ORDER_PROCESSING
  orderProcessingEmail(order: Order): { subject: string; html: string; text: string } {
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #FAFAF7; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px 24px; border: 1px solid #EAEAE4;">
        <h2 style="color: #123C2A; margin-top: 0;">Order in Preparation</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Hello <strong>${order.customerName}</strong>, your Order <strong>#${order.orderNumber}</strong> is currently being prepared by our fulfillment team.
        </p>
      </div>
    </body>
    </html>`;
    const text = `Order #${order.orderNumber} is being processed. Hello ${order.customerName}, our team is preparing your items.`;
    return { subject: `Order in Preparation: #${order.orderNumber} - Glow Face Skincare`, html, text };
  },

  orderProcessingWhatsApp(order: Order): string {
    return `🌿 *Glow Face Skincare* — Order Processing\n\nHello ${order.customerName},\nYour Order *#${order.orderNumber}* is currently being prepared for shipment.`;
  },

  // 4. ORDER_PACKED
  orderPackedEmail(order: Order): { subject: string; html: string; text: string } {
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #FAFAF7; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px 24px; border: 1px solid #EAEAE4;">
        <h2 style="color: #123C2A; margin-top: 0;">Order Packed & Ready for Dispatch 📦</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Hello <strong>${order.customerName}</strong>, your Order <strong>#${order.orderNumber}</strong> has been safely packaged and is ready for courier pickup.
        </p>
      </div>
    </body>
    </html>`;
    const text = `Order #${order.orderNumber} is packed. Hello ${order.customerName}, your items are ready for courier pickup.`;
    return { subject: `Order Packed: #${order.orderNumber} - Glow Face Skincare`, html, text };
  },

  orderPackedWhatsApp(order: Order): string {
    return `📦 *Glow Face Skincare* — Order Packed!\n\nHello ${order.customerName},\nYour Order *#${order.orderNumber}* is packed and ready for courier handover.`;
  },

  // 5. ORDER_SHIPPED
  orderShippedEmail(order: Order): { subject: string; html: string; text: string } {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAF7; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #EAEAE4;">
        <div style="background: #123C2A; padding: 28px 24px; text-align: center;">
          <h1 style="color: #FFFDF9; margin: 0; font-size: 22px;">GLOW FACE</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #123C2A; font-size: 20px; margin-top: 0;">Your Order is On Its Way! 🚚</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Exciting news, <strong>${order.customerName}</strong>! Your order <strong>#${order.orderNumber}</strong> has been handed over to our logistics partner.
          </p>

          <div style="background: #F4F6F0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #123C2A;"><strong>Carrier:</strong> ${order.carrier || "Standard Surface Express"}</p>
            <p style="margin: 6px 0 0 0; font-size: 14px; color: #123C2A;"><strong>Tracking AWB:</strong> <span style="font-family: monospace; background: #FFF; padding: 2px 6px; border-radius: 4px;">${order.trackingNumber || "Pending Scan"}</span></p>
          </div>

          <p style="color: #64748b; font-size: 13px;">
            Estimated delivery: 2-4 business days. Keep this tracking code handy to monitor the package.
          </p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `Your Glow Face Order #${order.orderNumber} has been shipped via ${order.carrier || "Surface Express"}. Tracking ID: ${order.trackingNumber || "N/A"}.`;
    return { subject: `Order Shipped: #${order.orderNumber} - Glow Face Skincare`, html, text };
  },

  orderShippedWhatsApp(order: Order): string {
    return `🚚 *Glow Face Skincare* — Order Dispatched!\n\nHello ${order.customerName},\nYour Order *#${order.orderNumber}* is on its way!\n\n📦 *Carrier:* ${order.carrier || "Surface Express"}\n🔍 *Tracking Number:* ${order.trackingNumber || "Pending"}\n\nExpect delivery in 2-4 business days. Thank you for choosing Glow Face! ✨`;
  },

  // 6. OUT_FOR_DELIVERY
  outForDeliveryWhatsApp(order: Order): string {
    return `📦 *Glow Face Skincare* — Out for Delivery Today!\n\nHello ${order.customerName},\nYour Order *#${order.orderNumber}* is out for delivery with our courier partner. Please keep your phone reachable. ✨`;
  },

  // 7. ORDER_DELIVERED
  orderDeliveredEmail(order: Order): { subject: string; html: string; text: string } {
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #FAFAF7; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px 24px; border: 1px solid #EAEAE4;">
        <h2 style="color: #123C2A; margin-top: 0;">Order Delivered 🎉</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Hello <strong>${order.customerName}</strong>, your package for Order <strong>#${order.orderNumber}</strong> has been safely delivered!
        </p>
        <p style="color: #64748b; font-size: 14px;">
          We hope you enjoy your skincare essentials. If you have any inquiries, reply to this email anytime.
        </p>
      </div>
    </body>
    </html>`;
    const text = `Order Delivered: #${order.orderNumber}. Hello ${order.customerName}, your package has been delivered. Enjoy your Glow Face essentials!`;
    return { subject: `Order Delivered: #${order.orderNumber} - Glow Face Skincare`, html, text };
  },

  orderDeliveredWhatsApp(order: Order): string {
    return `🎉 *Glow Face Skincare* — Order Delivered!\n\nHello ${order.customerName},\nYour package for Order *#${order.orderNumber}* has been delivered! We hope you love your new skincare essentials. Have questions? Reply to this message anytime! 🌿`;
  },

  // 8. PAYMENT_FAILED
  paymentFailedEmail(order: Order): { subject: string; html: string; text: string } {
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #FAFAF7; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px 24px; border: 1px solid #EAEAE4;">
        <h2 style="color: #b91c1c; margin-top: 0;">Payment Incomplete</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Hello <strong>${order.customerName}</strong>, we noticed the payment for Order <strong>#${order.orderNumber}</strong> was not completed. Your shopping bag is saved and you can retry your checkout anytime.
        </p>
      </div>
    </body>
    </html>`;
    const text = `Payment Alert for Order #${order.orderNumber}. The transaction was not completed. You can retry checkout anytime on Glow Face.`;
    return { subject: `Payment Incomplete: #${order.orderNumber} - Glow Face Skincare`, html, text };
  },

  paymentFailedWhatsApp(order: Order): string {
    return `⚠️ *Glow Face Skincare* — Payment Incomplete\n\nHello ${order.customerName},\nWe noticed your payment for Order *#${order.orderNumber}* could not be processed. Your bag is saved! You can complete your order anytime by visiting our store.`;
  },

  // 9. ORDER_CANCELLED
  orderCancelledEmail(order: Order): { subject: string; html: string; text: string } {
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #FAFAF7; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px 24px; border: 1px solid #EAEAE4;">
        <h2 style="color: #123C2A; margin-top: 0;">Order Cancelled</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Hello <strong>${order.customerName}</strong>, your Order <strong>#${order.orderNumber}</strong> has been cancelled. Any deducted amount will be refunded to your source account within 3-5 business days.
        </p>
      </div>
    </body>
    </html>`;
    const text = `Order #${order.orderNumber} has been cancelled. Any deducted funds will be refunded within 3-5 business days.`;
    return { subject: `Order Cancelled: #${order.orderNumber} - Glow Face Skincare`, html, text };
  },

  orderCancelledWhatsApp(order: Order): string {
    return `ℹ️ *Glow Face Skincare* — Order Cancelled\n\nHello ${order.customerName},\nYour Order *#${order.orderNumber}* has been cancelled. Any deducted payment will be refunded back to your source account within 3-5 business days.`;
  },

  // 10. ADMIN LOW-STOCK ALERT
  adminLowStockEmail(product: { name: string; sku?: string | null; stock: number; lowStockThreshold: number }): { subject: string; html: string; text: string } {
    const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #b45309;">⚠️ Inventory Radar: Low Stock Alert</h2>
      <p>The following product has reached or fallen below its configured threshold:</p>
      <ul>
        <li><strong>Product:</strong> ${product.name}</li>
        <li><strong>SKU:</strong> ${product.sku || "N/A"}</li>
        <li><strong>Current Stock:</strong> <span style="color: #dc2626; font-weight: bold;">${product.stock} units remaining</span></li>
        <li><strong>Threshold:</strong> ${product.lowStockThreshold} units</li>
      </ul>
      <p>Please restock soon to prevent out-of-stock cart drop-offs.</p>
    </div>`;

    const text = `Low Stock Alert: ${product.name} has only ${product.stock} units remaining (Threshold: ${product.lowStockThreshold}).`;
    return { subject: `⚠️ Low Stock Alert: ${product.name} (${product.stock} left)`, html, text };
  }
};
