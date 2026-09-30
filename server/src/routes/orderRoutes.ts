import { Router } from "express";
import { orderController } from "../controllers/orderController.js";
import { requireAdmin, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Customer order routes
router.post("/", optionalAuth, orderController.createOrder);
router.post("/verify", orderController.verifyPayment);
router.get("/my-orders", optionalAuth, orderController.getCustomerOrders);
router.get("/track/:id", orderController.getOrder);

// Admin-only order management routes
router.get("/admin/list", requireAdmin, orderController.getAdminOrders);
router.get("/admin/:id", requireAdmin, orderController.getOrder);
router.patch("/admin/:id/status", requireAdmin, orderController.updateOrderStatus);
router.patch("/:id/status", requireAdmin, orderController.updateOrderStatus);

export default router;
