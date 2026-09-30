import { Request, Response, NextFunction } from "express";
import { cloudinaryService } from "../services/cloudinaryService.js";
import { HttpError } from "../middleware/errorHandler.js";

export const mediaController = {
  async uploadSingle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new HttpError(400, "No image file provided in request.");
      }

      const folder = (req.body.folder as string) || "products";
      const result = await cloudinaryService.uploadProductImage(
        req.file.buffer,
        req.file.originalname,
        folder
      );

      res.status(201).json({
        ok: true,
        image: result
      });
    } catch (err) {
      next(err);
    }
  },

  async uploadMultiple(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        throw new HttpError(400, "No image files provided in request.");
      }

      const folder = (req.body.folder as string) || "products";
      const results = await cloudinaryService.uploadMultipleImages(
        files.map(f => ({ buffer: f.buffer, originalname: f.originalname })),
        folder
      );

      res.status(201).json({
        ok: true,
        images: results
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, publicId } = req.body;
      const target = url || publicId;

      if (!target) {
        throw new HttpError(400, "Image URL or publicId is required for deletion.");
      }

      const success = await cloudinaryService.deleteProductImage(target);
      res.json({
        ok: true,
        deleted: success
      });
    } catch (err) {
      next(err);
    }
  }
};
