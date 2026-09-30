import { Request, Response, NextFunction } from "express";
import { socialService } from "../services/socialService.js";

export const socialController = {
  async getInstagramFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feed = await socialService.getInstagramFeed();
      res.json({ ok: true, feed });
    } catch (err) {
      next(err);
    }
  }
};
