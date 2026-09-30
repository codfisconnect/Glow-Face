import { getDatabase } from "../config/database.js";
import { Coupon, DiscountType } from "../types/index.js";
import { HttpError } from "../middleware/errorHandler.js";

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discount: number;
  description?: string;
  message?: string;
  coupon?: Coupon;
}

export class CouponService {
  async getCouponByCode(code: string): Promise<Coupon | null> {
    const { type, db } = getDatabase();
    const cleanCode = code.trim().toUpperCase();

    if (type === "prisma") {
      const c = await db.coupon.findUnique({
        where: { code: cleanCode }
      });
      if (!c) return null;
      return {
        ...c,
        discountType: c.discountType as DiscountType
      };
    }

    const c = db.coupons.get(cleanCode);
    return c || null;
  }

  async validateCoupon(code: string, cartTotal: number, customerEmail?: string): Promise<CouponValidationResult> {
    if (!code || !code.trim()) {
      return { valid: false, code: "", discount: 0, message: "Please provide a coupon code." };
    }

    const coupon = await this.getCouponByCode(code);
    if (!coupon || !coupon.active) {
      return { valid: false, code, discount: 0, message: "Invalid or inactive promotional code." };
    }

    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      return { valid: false, code, discount: 0, message: "This coupon is not yet active." };
    }

    if (coupon.endDate && now > new Date(coupon.endDate)) {
      return { valid: false, code, discount: 0, message: "This coupon code has expired." };
    }

    if (cartTotal < coupon.minOrderAmount) {
      return {
        valid: false,
        code,
        discount: 0,
        message: `Minimum bag value of ₹${coupon.minOrderAmount} required for this coupon.`
      };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, code, discount: 0, message: "This promotional code has reached its maximum redemptions." };
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = Math.round((cartTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, cartTotal);
    }

    return {
      valid: true,
      code: coupon.code,
      discount,
      description: coupon.description || undefined,
      message: `Coupon ${coupon.code} applied successfully!`,
      coupon
    };
  }

  async incrementUsage(code: string): Promise<void> {
    const { type, db } = getDatabase();
    const cleanCode = code.trim().toUpperCase();

    if (type === "prisma") {
      await db.coupon.update({
        where: { code: cleanCode },
        data: { usedCount: { increment: 1 } }
      }).catch((err: Error) => console.warn("Could not increment coupon usage:", err.message));
      return;
    }

    const c = db.coupons.get(cleanCode);
    if (c) {
      c.usedCount++;
      db.coupons.set(cleanCode, c);
    }
  }

  async getAllCoupons(): Promise<Coupon[]> {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      const all = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
      return all.map(c => ({ ...c, discountType: c.discountType as DiscountType }));
    }
    return Array.from(db.coupons.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createCoupon(data: {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    perCustomerLimit?: number;
    active?: boolean;
  }): Promise<Coupon> {
    const { type, db } = getDatabase();
    const cleanCode = data.code.trim().toUpperCase();

    const existing = await this.getCouponByCode(cleanCode);
    if (existing) {
      throw new HttpError(400, `Coupon with code '${cleanCode}' already exists.`);
    }

    const newCoupon: Coupon = {
      id: `coup_${Date.now()}`,
      code: cleanCode,
      description: data.description || null,
      discountType: data.discountType || "PERCENTAGE",
      discountValue: Number(data.discountValue),
      minOrderAmount: Number(data.minOrderAmount || 0),
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
      usedCount: 0,
      perCustomerLimit: Number(data.perCustomerLimit || 1),
      active: data.active !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (type === "prisma") {
      const created = await db.coupon.create({
        data: {
          code: newCoupon.code,
          description: newCoupon.description,
          discountType: newCoupon.discountType,
          discountValue: newCoupon.discountValue,
          minOrderAmount: newCoupon.minOrderAmount,
          maxDiscount: newCoupon.maxDiscount,
          startDate: newCoupon.startDate,
          endDate: newCoupon.endDate,
          usageLimit: newCoupon.usageLimit,
          usedCount: newCoupon.usedCount,
          perCustomerLimit: newCoupon.perCustomerLimit,
          active: newCoupon.active
        }
      });
      return { ...created, discountType: created.discountType as DiscountType };
    }

    db.coupons.set(cleanCode, newCoupon);
    return newCoupon;
  }

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const { type, db } = getDatabase();

    if (type === "prisma") {
      const updated = await db.coupon.update({
        where: { id },
        data: {
          ...updates,
          code: updates.code ? updates.code.trim().toUpperCase() : undefined
        }
      });
      return { ...updated, discountType: updated.discountType as DiscountType };
    }

    const found = Array.from(db.coupons.values()).find(c => c.id === id);
    if (!found) throw new HttpError(404, "Coupon not found");

    const updatedCoupon: Coupon = {
      ...found,
      ...updates,
      code: updates.code ? updates.code.trim().toUpperCase() : found.code,
      updatedAt: new Date()
    };
    db.coupons.set(updatedCoupon.code, updatedCoupon);
    return updatedCoupon;
  }
}

export const couponService = new CouponService();
