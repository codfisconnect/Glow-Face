import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authenticateToken, authController.getProfile);

export default router;
