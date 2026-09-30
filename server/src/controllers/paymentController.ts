import { Request, Response, NextFunction } from "express";
import { couponService } from "../services/couponService.js";
import { orderService } from "../services/orderService.js";

export const paymentController = {
  async validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, cartTotal } = req.body;
      const result = await couponService.validateCoupon(code, Number(cartTotal || 0), req.user?.email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { items, coupon, customer, shippingAddress } = req.body;
      const result = await orderService.createOrder({
        items,
        couponCode: coupon,
        customer,
        shippingAddress,
        userId: req.user?.id || null
      });
      res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const result = await orderService.verifyPayment({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      });
      res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  }
};
