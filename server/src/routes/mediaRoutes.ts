import { Router } from "express";
import { mediaController } from "../controllers/mediaController.js";
import { requireAdmin } from "../middleware/auth.js";
import { uploadMiddleware } from "../middleware/upload.js";

const router = Router();

// Admin protected media upload and management endpoints
router.post(
  "/upload",
  requireAdmin,
  uploadMiddleware.single("image"),
  mediaController.uploadSingle
);

router.post(
  "/upload-multiple",
  requireAdmin,
  uploadMiddleware.array("images", 10),
  mediaController.uploadMultiple
);

router.delete(
  "/delete",
  requireAdmin,
  mediaController.deleteImage
);

router.post(
  "/delete",
  requireAdmin,
  mediaController.deleteImage
);

export default router;
