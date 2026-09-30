import { Router } from "express";
import { paymentController } from "../controllers/paymentController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.post("/validate-coupon", optionalAuth, paymentController.validateCoupon);
router.post("/create-order", optionalAuth, paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);

export default router;
