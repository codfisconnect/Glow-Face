import { Router } from "express";
import { productController } from "../controllers/productController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", productController.getProducts);
router.get("/categories", productController.getCategories);
router.get("/:slug", productController.getProductBySlug);

// Admin catalog management
router.post("/", requireAdmin, productController.createProduct);
router.patch("/:id", requireAdmin, productController.updateProduct);
router.delete("/:id", requireAdmin, productController.deleteProduct);

export default router;
