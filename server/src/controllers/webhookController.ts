import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/paymentService.js";
import { orderService } from "../services/orderService.js";

export const webhookController = {
  async handleRazorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      // Verify HMAC-SHA256 webhook signature
      const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn("⚠️ Invalid Razorpay webhook signature received!");
        res.status(400).json({ ok: false, error: "Invalid cryptographic webhook signature." });
        return;
      }

      const event = req.body.event;
      const payload = req.body.payload;

      const result = await orderService.processWebhookEvent(event, payload);
      res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  }
};
