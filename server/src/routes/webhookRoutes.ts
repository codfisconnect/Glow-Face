import { Router } from "express";
import { webhookController } from "../controllers/webhookController.js";

const router = Router();

// Endpoint: /api/webhook/razorpay
router.post("/razorpay", webhookController.handleRazorpayWebhook);

export default router;
