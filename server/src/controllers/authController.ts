import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService.js";
import { HttpError } from "../middleware/errorHandler.js";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, phone } = req.body;
      const result = await authService.register({ email, password, name, phone });
      res.status(201).json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) throw new HttpError(401, "Unauthorized");
      const user = await authService.getProfile(req.user.id);
      res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  }
};
