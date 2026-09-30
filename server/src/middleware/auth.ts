import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { HttpError } from "./errorHandler.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return next(new HttpError(401, "Authentication token required."));
  }

  if (!ENV.JWT_SECRET) {
    return next(new HttpError(500, "JWT_SECRET configuration missing on server."));
  }

  jwt.verify(token, ENV.JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      return next(new HttpError(403, "Invalid or expired authentication session. Please log in again."));
    }
    req.user = decoded as AuthenticatedUser;
    next();
  });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  authenticateToken(req, res, () => {
    if (req.user?.role !== "ADMIN") {
      return next(new HttpError(403, "Access restricted to Glow Face store administrators."));
    }
    next();
  });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token || !ENV.JWT_SECRET) {
    return next();
  }

  jwt.verify(token, ENV.JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded as AuthenticatedUser;
    }
    next();
  });
}
