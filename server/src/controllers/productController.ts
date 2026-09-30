import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService.js";

export const productController = {
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, search, sortBy, inStock, minPrice, maxPrice, page, limit } = req.query;
      const result = await productService.getProducts({
        category: category as string | undefined,
        search: search as string | undefined,
        sortBy: sortBy as string | undefined,
        inStockOnly: inStock === "true",
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50
      });
      res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductBySlug(req.params.slug as string);
      res.json({ ok: true, product });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await productService.getCategories();
      res.json({ ok: true, categories });
    } catch (err) {
      next(err);
    }
  },

  async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const categories = await productService.getAllCategories(includeInactive);
      res.json({ ok: true, categories });
    } catch (err) {
      next(err);
    }
  },

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await productService.createCategory(req.body);
      res.status(201).json({ ok: true, category });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await productService.updateCategory(req.params.id as string, req.body);
      res.json({ ok: true, category });
    } catch (err) {
      next(err);
    }
  },

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await productService.deleteCategory(req.params.id as string);
      res.json({ ok: true, message: "Category deactivated successfully" });
    } catch (err) {
      next(err);
    }
  },

  async reorderCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ ok: false, error: "orderedIds must be an array of category IDs" });
        return;
      }
      await productService.reorderCategories(orderedIds);
      res.json({ ok: true, message: "Categories reordered successfully" });
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({ ok: true, product });
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.updateProduct(req.params.id as string, req.body);
      res.json({ ok: true, product });
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await productService.deleteProduct(req.params.id as string);
      res.json({ ok: true, message: "Product deactivated successfully" });
    } catch (err) {
      next(err);
    }
  }
};
