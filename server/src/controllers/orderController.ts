import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/orderService.js";
import { HttpError } from "../middleware/errorHandler.js";

export const orderController = {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { items, coupon, customer, shippingAddress } = req.body;
      const userId = req.user?.id || null;
      const order = await orderService.createOrder({
        items,
        couponCode: coupon,
        customer,
        shippingAddress,
        userId
      });
      res.status(201).json({ ok: true, ...order });
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
  },

  async getCustomerOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const email = (req.user?.email || req.query.email) as string | undefined;
      if (!userId && !email) {
        throw new HttpError(400, "User ID or email is required to view orders.");
      }
      const orders = await orderService.getCustomerOrders({ userId, email });
      res.json({ ok: true, orders });
    } catch (err) {
      next(err);
    }
  },

  async getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getOrder(req.params.id as string);
      res.json({ ok: true, order });
    } catch (err) {
      next(err);
    }
  },

  async getAdminOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status, paymentStatus, startDate, endDate, page, limit } = req.query;
      const result = await orderService.getAdminOrders({
        search: search as string | undefined,
        status: status as string | undefined,
        paymentStatus: paymentStatus as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20
      });
      res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderStatus, carrier, trackingNumber, notes } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id as string, {
        orderStatus,
        carrier,
        trackingNumber,
        notes,
        adminEmail: req.user?.email
      });
      res.json({ ok: true, order });
    } catch (err) {
      next(err);
    }
  }
};
