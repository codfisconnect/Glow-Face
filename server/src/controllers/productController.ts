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
