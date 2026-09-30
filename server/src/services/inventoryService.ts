import { getDatabase } from "../config/database.js";
import { productService } from "./productService.js";
import { notificationService } from "./notifications/notificationService.js";
import { HttpError } from "../middleware/errorHandler.js";

export class InventoryService {
  async getInventoryStatus() {
    const { type, db } = getDatabase();
    let products: any[] = [];

    if (type === "prisma") {
      products = await db.product.findMany({
        where: { active: true },
        orderBy: { stock: "asc" }
      });
    } else {
      products = Array.from(db.products.values())
        .filter(p => p.active)
        .sort((a, b) => a.stock - b.stock);
    }

    const lowStockThreshold = 10;

    const summary = {
      totalProducts: products.length,
      inStockCount: products.filter(p => p.stock > (p.lowStockThreshold || lowStockThreshold)).length,
      lowStockCount: products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || lowStockThreshold)).length,
      outOfStockCount: products.filter(p => p.stock <= 0).length
    };

    const items = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku || `GF-${p.id.slice(-4)}`,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold || lowStockThreshold,
      status: p.stock <= 0 ? "OUT_OF_STOCK" : (p.stock <= (p.lowStockThreshold || lowStockThreshold) ? "LOW_STOCK" : "IN_STOCK"),
      price: p.price,
      categorySlug: p.categorySlug
    }));

    return { summary, items };
  }

  async updateStock(productId: string, stock: number, lowStockThreshold?: number, adminEmail?: string) {
    if (isNaN(stock) || stock < 0) {
      throw new HttpError(400, "Stock quantity must be a non-negative number.");
    }

    const { type, db } = getDatabase();
    const product = await productService.getProductBySlug(productId);
    const previousStock = product.stock;

    const updates: any = { stock: Number(stock) };
    if (lowStockThreshold !== undefined) {
      updates.lowStockThreshold = Number(lowStockThreshold);
    }

    const updated = await productService.updateProduct(product.id, updates);

    // If stock increased above threshold, clear low-stock debounce
    const threshold = updated.lowStockThreshold || 10;
    if (updated.stock > threshold) {
      notificationService.resetLowStockAlert(product.id);
    } else if (updated.stock <= threshold && previousStock > threshold) {
      // Trigger low-stock alert if just crossed below
      notificationService.notifyLowStock({ ...updated, stock: updated.stock });
    }

    // Record admin activity
    try {
      const details = JSON.stringify({
        productId: product.id,
        productName: product.name,
        previousStock,
        newStock: stock
      });

      if (type === "prisma") {
        await db.adminActivity.create({
          data: {
            adminEmail: adminEmail || "admin@glowface.com",
            action: "STOCK_ADJUSTMENT",
            entityType: "PRODUCT",
            entityId: product.id,
            details
          }
        });
      } else {
        db.adminActivities.unshift({
          id: `act_${Date.now()}`,
          adminEmail: adminEmail || "admin@glowface.com",
          action: "STOCK_ADJUSTMENT",
          entityType: "PRODUCT",
          entityId: product.id,
          details,
          createdAt: new Date()
        });
      }
    } catch (err: any) {
      console.warn("Could not log inventory activity:", err.message);
    }

    return updated;
  }
}

export const inventoryService = new InventoryService();
