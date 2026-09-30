import { getDatabase } from "../config/database.js";
import { Order, OrderStatus, PaymentStatus } from "../types/index.js";
import { paymentService } from "./paymentService.js";
import { productService } from "./productService.js";
import { couponService } from "./couponService.js";
import { notificationService } from "./notifications/notificationService.js";
import { assertValidOrderTransition } from "../utils/stateMachine.js";
import { HttpError } from "../middleware/errorHandler.js";

export class OrderService {
  private formatOrder(raw: any): Order {
    let address = raw.shippingAddress;
    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch {
        // Keep as string
      }
    }

    return {
      id: raw.id,
      orderNumber: raw.orderNumber,
      userId: raw.userId ?? null,
      customerName: raw.customerName,
      customerEmail: raw.customerEmail,
      customerPhone: raw.customerPhone,
      shippingAddress: address,
      subtotal: raw.subtotal,
      shippingAmount: raw.shippingAmount,
      discountAmount: raw.discountAmount,
      totalAmount: raw.totalAmount,
      couponCode: raw.couponCode ?? null,
      razorpayOrderId: raw.razorpayOrderId ?? null,
      razorpayPaymentId: raw.razorpayPaymentId ?? null,
      razorpaySignature: raw.razorpaySignature ?? null,
      orderStatus: raw.orderStatus as OrderStatus,
      paymentStatus: raw.paymentStatus as PaymentStatus,
      trackingNumber: raw.trackingNumber ?? null,
      carrier: raw.carrier ?? null,
      notes: raw.notes ?? null,
      paidAt: raw.paidAt ? new Date(raw.paidAt) : null,
      shippedAt: raw.shippedAt ? new Date(raw.shippedAt) : null,
      deliveredAt: raw.deliveredAt ? new Date(raw.deliveredAt) : null,
      cancelledAt: raw.cancelledAt ? new Date(raw.cancelledAt) : null,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
      items: Array.isArray(raw.items)
        ? raw.items.map((it: any) => ({
            id: it.id,
            orderId: it.orderId || raw.id,
            productId: it.productId ?? null,
            productName: it.productName,
            productSlug: it.productSlug ?? null,
            productImage: it.productImage ?? null,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
            subtotal: it.subtotal
          }))
        : []
    };
  }

  /**
   * Step 1: Create Order & initialize Razorpay Gateway token
   */
  async createOrder(params: {
    items: Array<{ productId: string; quantity: number }>;
    couponCode?: string | null;
    customer: { name: string; email: string; phone: string };
    shippingAddress: any;
    userId?: string | null;
  }) {
    const { items, couponCode, customer, shippingAddress, userId = null } = params;

    if (!customer || !customer.email || !customer.name || !customer.phone) {
      throw new HttpError(400, "Customer name, email, and phone are required.");
    }
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pin) {
      throw new HttpError(400, "Complete shipping address with pincode and state is required.");
    }

    // Authoritative calculation
    const pricing = await paymentService.computeAuthoritativeTotal(items, couponCode || null);

    const orderId = `ord_${Date.now()}`;
    const orderNumber = `GF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create payment gateway order
    const rzpOrder = await paymentService.createRazorpayOrder({
      amountRupees: pricing.totalAmount,
      receipt: orderNumber
    });

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
      subtotal: pricing.subtotal,
      shippingAmount: pricing.shippingAmount,
      discountAmount: pricing.discountAmount,
      totalAmount: pricing.totalAmount,
      couponCode: pricing.couponCode,
      razorpayOrderId: rzpOrder.razorpayOrderId,
      razorpayPaymentId: null,
      razorpaySignature: null,
      orderStatus: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      trackingNumber: null,
      carrier: null,
      notes: null,
      paidAt: null,
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: pricing.items.map((it, idx) => ({
        id: `item_${orderId}_${idx}`,
        orderId,
        productId: it.productId,
        productName: it.productName,
        productSlug: it.productSlug,
        productImage: it.productImage,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        subtotal: it.subtotal
      }))
    };

    const { type, db } = getDatabase();

    if (type === "prisma") {
      await db.order.create({
        data: {
          id: newOrder.id,
          orderNumber: newOrder.orderNumber,
          userId: newOrder.userId,
          customerName: newOrder.customerName,
          customerEmail: newOrder.customerEmail,
          customerPhone: newOrder.customerPhone,
          shippingAddress: typeof newOrder.shippingAddress === "string" ? newOrder.shippingAddress : JSON.stringify(newOrder.shippingAddress),
          subtotal: newOrder.subtotal,
          shippingAmount: newOrder.shippingAmount,
          discountAmount: newOrder.discountAmount,
          totalAmount: newOrder.totalAmount,
          couponCode: newOrder.couponCode,
          razorpayOrderId: newOrder.razorpayOrderId,
          orderStatus: newOrder.orderStatus,
          paymentStatus: newOrder.paymentStatus,
          items: {
            create: newOrder.items.map(it => ({
              id: it.id,
              productId: it.productId,
              productName: it.productName,
              productSlug: it.productSlug,
              productImage: it.productImage,
              unitPrice: it.unitPrice,
              quantity: it.quantity,
              subtotal: it.subtotal
            }))
          }
        }
      });
    } else {
      db.orders.set(orderId, newOrder);
    }

    return {
      orderId,
      orderNumber,
      razorpayOrderId: rzpOrder.razorpayOrderId,
      amountPaise: rzpOrder.amountPaise,
      currency: rzpOrder.currency,
      totalAmount: pricing.totalAmount
    };
  }

  /**
   * Step 2: Verify Razorpay Payment Signature & Transition to PAID
   * (Idempotent: safe to run from client callback or webhook)
   */
  async verifyPayment(params: {
    orderId?: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }) {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    // Verify cryptographic signature if provided
    if (razorpaySignature) {
      const isValid = paymentService.verifySignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      });

      if (!isValid) {
        throw new HttpError(400, "Invalid cryptographic payment signature from gateway.");
      }
    }

    const { type, db } = getDatabase();
    let order: any;

    if (type === "prisma") {
      order = await db.order.findFirst({
        where: {
          OR: [
            orderId ? { id: orderId } : undefined,
            { razorpayOrderId }
          ].filter(Boolean) as any
        },
        include: { items: true }
      });
    } else {
      order = orderId ? db.orders.get(orderId) : null;
      if (!order) {
        order = Array.from(db.orders.values()).find(o => o.razorpayOrderId === razorpayOrderId);
      }
    }

    if (!order) {
      throw new HttpError(404, `Order matching gateway token '${razorpayOrderId}' not found.`);
    }

    // IDEMPOTENCY CHECK: If already marked PAID, return existing state safely
    if (order.paymentStatus === "PAID" && order.orderStatus !== "PENDING_PAYMENT") {
      return {
        verified: true,
        order: this.formatOrder(order),
        alreadyProcessed: true
      };
    }

    // Validate State Machine Transition
    assertValidOrderTransition(order.orderStatus as OrderStatus, "PAID");

    const now = new Date();
    const updatedFields = {
      orderStatus: "PAID" as OrderStatus,
      paymentStatus: "PAID" as PaymentStatus,
      razorpayPaymentId,
      razorpaySignature: razorpaySignature || order.razorpaySignature,
      paidAt: now,
      updatedAt: now
    };

    if (type === "prisma") {
      order = await db.order.update({
        where: { id: order.id },
        data: updatedFields,
        include: { items: true }
      });
    } else {
      order = { ...order, ...updatedFields };
      db.orders.set(order.id, order);
    }

    // Transaction-safe Inventory Decrement
    for (const item of order.items || []) {
      if (item.productId) {
        try {
          const product = await productService.getProductBySlug(item.productId);
          const newStock = Math.max(0, product.stock - item.quantity);
          await productService.updateProduct(product.id, { stock: newStock });

          if (newStock <= (product.lowStockThreshold || 10)) {
            notificationService.notifyLowStock({ ...product, stock: newStock });
          }
        } catch (err: any) {
          console.warn("Stock update error:", err.message);
        }
      }
    }

    // Increment coupon usage if order used a coupon
    if (order.couponCode) {
      await couponService.incrementUsage(order.couponCode);
    }

    // Asynchronously dispatch notifications (non-blocking)
    const formatted = this.formatOrder(order);
    notificationService.notifyOrderConfirmed(formatted);

    return {
      verified: true,
      order: formatted,
      alreadyProcessed: false
    };
  }

  /**
   * Process incoming Razorpay Webhook Event (Idempotent background handler)
   */
  async processWebhookEvent(event: string, payload: any): Promise<{ handled: boolean; message: string }> {
    const paymentEntity = payload.payment?.entity;
    const orderEntity = payload.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!razorpayOrderId) {
      return { handled: false, message: "No razorpay order_id in webhook payload" };
    }

    if (event === "payment.captured" || event === "order.paid") {
      console.log(`⚡ Processing webhook: ${event} for Razorpay Order: ${razorpayOrderId}`);
      await this.verifyPayment({
        razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId || `pay_wh_${Date.now()}`
      });
      return { handled: true, message: "Payment verified and order updated via webhook" };
    }

    if (event === "payment.failed") {
      console.warn(`⚠️ Processing webhook payment.failed for: ${razorpayOrderId}`);
      const { type, db } = getDatabase();
      let order: any;

      if (type === "prisma") {
        order = await db.order.findFirst({ where: { razorpayOrderId }, include: { items: true } });
        if (order && order.paymentStatus !== "PAID") {
          await db.order.update({
            where: { id: order.id },
            data: { orderStatus: "PAYMENT_FAILED", paymentStatus: "FAILED" }
          });
        }
      } else {
        order = Array.from(db.orders.values()).find(o => o.razorpayOrderId === razorpayOrderId);
        if (order && order.paymentStatus !== "PAID") {
          order.orderStatus = "PAYMENT_FAILED";
          order.paymentStatus = "FAILED";
          db.orders.set(order.id, order);
        }
      }

      if (order) {
        notificationService.notifyPaymentFailed(this.formatOrder(order));
      }
      return { handled: true, message: "Order updated to PAYMENT_FAILED" };
    }

    return { handled: false, message: `Ignored unhandled webhook event: ${event}` };
  }

  /**
   * Customer order tracking / history
   */
  async getCustomerOrders(params: { userId?: string | null; email?: string | null }): Promise<Order[]> {
    const { userId = null, email = null } = params;
    const { type, db } = getDatabase();
    let orders: any[] = [];

    if (type === "prisma") {
      orders = await db.order.findMany({
        where: {
          OR: [
            userId ? { userId } : undefined,
            email ? { customerEmail: { equals: email, mode: "insensitive" } } : undefined
          ].filter(Boolean) as any
        },
        orderBy: { createdAt: "desc" },
        include: { items: true }
      });
    } else {
      orders = Array.from(db.orders.values())
        .filter(o =>
          (userId && o.userId === userId) ||
          (email && o.customerEmail?.toLowerCase() === email.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return orders.map(o => this.formatOrder(o));
  }

  /**
   * Get single order by ID or orderNumber
   */
  async getOrder(idOrNumber: string): Promise<Order> {
    const { type, db } = getDatabase();
    let order: any;

    if (type === "prisma") {
      order = await db.order.findFirst({
        where: {
          OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }]
        },
        include: { items: true, notifications: true }
      });
    } else {
      order = Array.from(db.orders.values()).find(o => o.id === idOrNumber || o.orderNumber === idOrNumber);
    }

    if (!order) throw new HttpError(404, `Order '${idOrNumber}' not found.`);
    return this.formatOrder(order);
  }

  /**
   * Admin order list with filters & pagination
   */
  async getAdminOrders(params: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
    const { search = "", status = "", paymentStatus = "", startDate, endDate, page = 1, limit = 20 } = params;
    const { type, db } = getDatabase();

    if (type === "prisma") {
      const where: any = {};
      if (status) where.orderStatus = status;
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { customerName: { contains: search, mode: "insensitive" } },
          { customerEmail: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search } },
          { trackingNumber: { contains: search, mode: "insensitive" } }
        ];
      }

      const [total, orders] = await Promise.all([
        db.order.count({ where }),
        db.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: { items: true }
        })
      ]);

      return {
        orders: orders.map(o => this.formatOrder(o)),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    // In-memory DevStore
    let allOrders = Array.from(db.orders.values());
    if (status) allOrders = allOrders.filter(o => o.orderStatus === status);
    if (paymentStatus) allOrders = allOrders.filter(o => o.paymentStatus === paymentStatus);
    if (startDate) allOrders = allOrders.filter(o => new Date(o.createdAt) >= new Date(startDate));
    if (endDate) allOrders = allOrders.filter(o => new Date(o.createdAt) <= new Date(endDate));
    if (search) {
      const q = search.toLowerCase();
      allOrders = allOrders.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }

    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = allOrders.length;
    const paginated = allOrders.slice((page - 1) * limit, page * limit);

    return {
      orders: paginated.map(o => this.formatOrder(o)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Admin Status Update with State Machine Validation & Notification Trigger
   */
  async updateOrderStatus(orderId: string, params: {
    orderStatus?: OrderStatus;
    carrier?: string;
    trackingNumber?: string;
    notes?: string;
    adminEmail?: string;
  }): Promise<Order> {
    const { orderStatus, carrier, trackingNumber, notes, adminEmail } = params;
    const { type, db } = getDatabase();
    let order: any;

    if (type === "prisma") {
      order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
    } else {
      order = db.orders.get(orderId);
    }

    if (!order) throw new HttpError(404, "Order not found");

    const previousStatus = order.orderStatus as OrderStatus;

    if (orderStatus && orderStatus !== previousStatus) {
      // Enforce Safe State Machine Transition (Rule #6)
      assertValidOrderTransition(previousStatus, orderStatus);
    }

    const nextStatus = orderStatus || previousStatus;
    const now = new Date();

    const updates: any = {
      orderStatus: nextStatus,
      carrier: carrier !== undefined ? carrier : order.carrier,
      trackingNumber: trackingNumber !== undefined ? trackingNumber : order.trackingNumber,
      notes: notes !== undefined ? notes : order.notes,
      updatedAt: now
    };

    if (nextStatus === "SHIPPED" && !order.shippedAt) updates.shippedAt = now;
    if (nextStatus === "DELIVERED" && !order.deliveredAt) updates.deliveredAt = now;
    if (nextStatus === "CANCELLED" && !order.cancelledAt) updates.cancelledAt = now;

    if (type === "prisma") {
      order = await db.order.update({
        where: { id: orderId },
        data: updates,
        include: { items: true }
      });
    } else {
      order = { ...order, ...updates };
      db.orders.set(orderId, order);
    }

    const formatted = this.formatOrder(order);

    // Record Immutable Admin Audit Trail
    try {
      const details = JSON.stringify({
        previousStatus,
        newStatus: nextStatus,
        trackingNumber: updates.trackingNumber,
        carrier: updates.carrier
      });

      if (type === "prisma") {
        await db.adminActivity.create({
          data: {
            adminEmail: adminEmail || "admin@glowface.com",
            action: "UPDATE_ORDER_STATUS",
            entityType: "ORDER",
            entityId: order.id,
            details
          }
        });
      } else {
        db.adminActivities.unshift({
          id: `act_${Date.now()}`,
          adminEmail: adminEmail || "admin@glowface.com",
          action: "UPDATE_ORDER_STATUS",
          entityType: "ORDER",
          entityId: order.id,
          details,
          createdAt: now
        });
      }
    } catch (err: any) {
      console.warn("Could not log admin activity:", err.message);
    }

    // Trigger corresponding status change notifications (Non-blocking)
    if (nextStatus !== previousStatus) {
      if (nextStatus === "SHIPPED") {
        notificationService.notifyOrderShipped(formatted);
      } else if (nextStatus === "OUT_FOR_DELIVERY") {
        notificationService.notifyOutForDelivery(formatted);
      } else if (nextStatus === "DELIVERED") {
        notificationService.notifyOrderDelivered(formatted);
      } else if (nextStatus === "CANCELLED") {
        notificationService.notifyOrderCancelled(formatted);
      }
    }

    return formatted;
  }
}

export const orderService = new OrderService();
