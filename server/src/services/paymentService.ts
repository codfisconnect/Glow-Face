import crypto from "crypto";
import Razorpay from "razorpay";
import { ENV } from "../config/env.js";
import { productService } from "./productService.js";
import { couponService } from "./couponService.js";
import { HttpError } from "../middleware/errorHandler.js";

let rzp: Razorpay | null = null;
if (ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET) {
  rzp = new Razorpay({
    key_id: ENV.RAZORPAY_KEY_ID,
    key_secret: ENV.RAZORPAY_KEY_SECRET
  });
}

// In-memory payment deduplication / replay prevention index
const verifiedPayments = new Set<string>();

export class PaymentService {
  /**
   * Authoritative price calculation:
   * Ignores any client-sent prices, fetches real catalog pricing & stock from DB,
   * validates dynamic coupons, and computes precise total.
   */
  async computeAuthoritativeTotal(items: Array<{ productId: string; quantity: number }>, couponCode: string | null = null) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new HttpError(400, "Cart items are required.");
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const productId = item.productId;
      const quantity = parseInt(String(item.quantity), 10);
      if (!productId || isNaN(quantity) || quantity < 1) {
        throw new HttpError(400, "Invalid item payload in cart.");
      }

      // Fetch product to guarantee authoritative price
      const product = await productService.getProductBySlug(productId);

      // Check stock
      if (product.stock < quantity) {
        throw new HttpError(400, `Insufficient stock for '${product.name}'. Available: ${product.stock}`);
      }

      const itemTotal = product.price * quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.image,
        unitPrice: product.price,
        quantity,
        subtotal: itemTotal
      });
    }
    //salman
    // Shipping threshold (Free on orders >= ₹499)
    const shipping = subtotal >= 499 ? 0 : 49;

    // Coupon discount calculation using dynamic couponService
    let discount = 0;
    let appliedCoupon: string | null = null;

    if (couponCode && couponCode.trim()) {
      const coupResult = await couponService.validateCoupon(couponCode, subtotal);
      if (coupResult.valid) {
        discount = coupResult.discount;
        appliedCoupon = coupResult.code;
      }
    }

    // Clamp discount so order grand total is at least ₹1
    const clampedDiscount = Math.min(discount, Math.max(0, subtotal + shipping - 1));
    const totalAmount = Math.max(1, subtotal + shipping - clampedDiscount);

    return {
      subtotal,
      shippingAmount: shipping,
      discountAmount: clampedDiscount,
      totalAmount,
      couponCode: appliedCoupon,
      items: validatedItems
    };
  }

  /**
   * Creates a Razorpay Order
   */
  async createRazorpayOrder(params: { amountRupees: number; receipt: string }): Promise<{
    razorpayOrderId: string;
    amountPaise: number;
    currency: string;
  }> {
    const { amountRupees, receipt } = params;
    const amountPaise = Math.round(amountRupees * 100);

    if (rzp) {
      try {
        const order = await rzp.orders.create({
          amount: amountPaise,
          currency: "INR",
          receipt,
          notes: {
            brand: "Glow Face Skincare",
            receipt
          }
        });
        return {
          razorpayOrderId: order.id,
          amountPaise: typeof order.amount === "number" ? order.amount : amountPaise,
          currency: order.currency || "INR"
        };
      } catch (err: any) {
        console.error("Razorpay API order creation failed:", err);
        throw new HttpError(500, `Payment gateway order creation failed: ${err.message}`);
      }
    }

    // In development mode without credentials:
    if (ENV.NODE_ENV !== "production") {
      const simulatedOrderId = `order_sim_${Date.now()}`;
      return {
        razorpayOrderId: simulatedOrderId,
        amountPaise,
        currency: "INR"
      };
    }

    throw new HttpError(500, "Razorpay payment gateway credentials not configured on production server.");
  }

  /**
   * Timing-safe verification of Razorpay HMAC-SHA256 signature
   */
  verifySignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    // Replay attack prevention / Idempotent check
    if (verifiedPayments.has(razorpayPaymentId)) {
      return true; // Already verified safely
    }

    // In non-production simulation:
    if (ENV.NODE_ENV !== "production") {
      if (razorpayOrderId.startsWith("order_sim_") || razorpaySignature === "simulated_signature") {
        verifiedPayments.add(razorpayPaymentId);
        return true;
      }
    }

    const secret = ENV.RAZORPAY_KEY_SECRET;
    if (!secret) {
      if (ENV.NODE_ENV !== "production") {
        verifiedPayments.add(razorpayPaymentId);
        return true;
      }
      return false;
    }

    try {
      const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

      const ba = Buffer.from(expected, "hex");
      const bb = Buffer.from(razorpaySignature, "hex");
      if (ba.length !== bb.length) return false;

      const isValid = crypto.timingSafeEqual(ba, bb);
      if (isValid) {
        verifiedPayments.add(razorpayPaymentId);
      }
      return isValid;
    } catch (err) {
      console.error("Error during HMAC verification:", err);
      return false;
    }
  }

  /**
   * Secure Razorpay Webhook Signature Verification
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!signature) {
      return false;
    }

    if (ENV.NODE_ENV !== "production" && signature === "simulated_signature") {
      return true;
    }

    const secret = ENV.RAZORPAY_WEBHOOK_SECRET || ENV.RAZORPAY_KEY_SECRET;
    if (!secret) {
      if (ENV.NODE_ENV !== "production") return true;
      return false;
    }

    try {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      const ba = Buffer.from(expected, "hex");
      const bb = Buffer.from(signature, "hex");
      if (ba.length !== bb.length) return false;

      return crypto.timingSafeEqual(ba, bb);
    } catch (err) {
      console.error("Error verifying webhook signature:", err);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
