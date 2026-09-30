import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env.js";

export class HttpError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || "An unexpected internal server error occurred.";

  if (statusCode >= 500) {
    console.error(`💥 [${req.method} ${req.originalUrl}] 500 Error:`, err);
  }

  res.status(statusCode).json({
    ok: false,
    error: message,
    ...(err.details ? { details: err.details } : {}),
    ...(ENV.NODE_ENV === "development" ? { stack: err.stack } : {})
  });
}
