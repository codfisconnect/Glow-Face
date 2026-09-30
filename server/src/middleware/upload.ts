import multer from "multer";
import { HttpError } from "./errorHandler.js";

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum per image
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new HttpError(400, `Invalid file type '${file.mimetype}'. Only JPEG, PNG, WebP, and AVIF are allowed.`));
    }
  }
});
