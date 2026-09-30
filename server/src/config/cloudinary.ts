import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    ENV.CLOUDINARY_CLOUD_NAME &&
    ENV.CLOUDINARY_API_KEY &&
    ENV.CLOUDINARY_API_SECRET
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
  });
}

export default cloudinary;
