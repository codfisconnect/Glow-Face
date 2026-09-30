import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Protect all admin routes
router.use(requireAdmin);

router.get("/metrics", adminController.getMetrics);
router.get("/inventory", adminController.getInventory);
router.patch("/inventory/:id", adminController.updateStock);
router.get("/notifications", adminController.getNotifications);
router.patch("/notifications/:id/read", adminController.markNotificationRead);
router.get("/activities", adminController.getActivities);
router.get("/customers", adminController.getCustomers);
router.get("/settings", adminController.getSettings);
router.post("/settings", adminController.updateSetting);

// Coupon management
router.get("/coupons", adminController.getCoupons);
router.post("/coupons", adminController.createCoupon);
router.patch("/coupons/:id", adminController.updateCoupon);

// Diagnostics & audit logs
router.get("/logs/notifications", adminController.getNotificationLogs);
router.get("/diagnostics/email", adminController.getEmailDiagnostics);

export default router;
