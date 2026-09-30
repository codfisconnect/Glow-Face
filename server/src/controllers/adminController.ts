import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/adminService.js";
import { inventoryService } from "../services/inventoryService.js";
import { couponService } from "../services/couponService.js";
import { getNotificationLogs } from "../services/notifications/notificationLogger.js";
import { verifyEmailDiagnostics } from "../services/notifications/emailService.js";

export const adminController = {
  async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const range = (req.query.range as string) || "30d";
      const metrics = await adminService.getDashboardMetrics(range);
      res.json({ ok: true, metrics });
    } catch (err) {
      next(err);
    }
  },

  async getInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inventory = await inventoryService.getInventoryStatus();
      res.json({ ok: true, ...inventory });
    } catch (err) {
      next(err);
    }
  },

  async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { stock, lowStockThreshold } = req.body;
      const updated = await inventoryService.updateStock(
        req.params.id as string,
        Number(stock),
        lowStockThreshold !== undefined ? Number(lowStockThreshold) : undefined,
        req.user?.email
      );
      res.json({ ok: true, product: updated });
    } catch (err) {
      next(err);
    }
  },

  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await adminService.getNotifications();
      res.json({ ok: true, notifications });
    } catch (err) {
      next(err);
    }
  },

  async markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.markNotificationRead(req.params.id as string);
      res.json({ ok: true, notification: result });
    } catch (err) {
      next(err);
    }
  },

  async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await adminService.getActivities();
      res.json({ ok: true, activities });
    } catch (err) {
      next(err);
    }
  },

  async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customers = await adminService.getCustomers();
      res.json({ ok: true, customers });
    } catch (err) {
      next(err);
    }
  },

  async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await adminService.getSettings();
      res.json({ ok: true, settings });
    } catch (err) {
      next(err);
    }
  },

  async updateSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key, value } = req.body;
      const result = await adminService.updateSetting(key, value);
      res.json({ ok: true, setting: result });
    } catch (err) {
      next(err);
    }
  },

  async getCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupons = await couponService.getAllCoupons();
      res.json({ ok: true, coupons });
    } catch (err) {
      next(err);
    }
  },

  async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await couponService.createCoupon(req.body);
      res.status(201).json({ ok: true, coupon });
    } catch (err) {
      next(err);
    }
  },

  async updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await couponService.updateCoupon(req.params.id as string, req.body);
      res.json({ ok: true, coupon });
    } catch (err) {
      next(err);
    }
  },

  async getNotificationLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await getNotificationLogs(req.query.orderId as string | undefined);
      res.json({ ok: true, logs });
    } catch (err) {
      next(err);
    }
  },

  async getEmailDiagnostics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const diagnostics = await verifyEmailDiagnostics();
      res.json({ ok: true, diagnostics });
    } catch (err) {
      next(err);
    }
  }
};
