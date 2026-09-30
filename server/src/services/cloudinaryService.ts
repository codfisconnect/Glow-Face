import { UploadApiResponse } from "cloudinary";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

export interface UploadedImageResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export const cloudinaryService = {
  /**
   * Upload an image buffer to Cloudinary with WebP conversion & auto quality.
   * Gracefully falls back to Data URI if Cloudinary credentials are not configured.
   */
  async uploadProductImage(
    buffer: Buffer,
    originalName: string,
    subfolder: string = "products"
  ): Promise<UploadedImageResult> {
    const extension = originalName.split(".").pop()?.toLowerCase() ?? "webp";

    if (!isCloudinaryConfigured()) {
      // Safe Development fallback: inline base64 Data URI
      const base64 = buffer.toString("base64");
      const mime =
        extension === "png"
          ? "image/png"
          : extension === "webp"
          ? "image/webp"
          : "image/jpeg";
      const dataUri = `data:${mime};base64,${base64}`;

      return {
        url: dataUri,
        secureUrl: dataUri,
        publicId: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        width: 800,
        height: 800,
        format: extension,
        bytes: buffer.length
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `glow-face/${subfolder}`,
          resource_type: "image",
          format: "webp",
          transformation: [
            { quality: "auto", fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary image upload failed."));
            return;
          }

          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          });
        }
      );

      uploadStream.end(buffer);
    });
  },

  /**
   * Upload multiple image buffers concurrently.
   */
  async uploadMultipleImages(
    files: Array<{ buffer: Buffer; originalname: string }>,
    subfolder: string = "products"
  ): Promise<UploadedImageResult[]> {
    return Promise.all(
      files.map(f => this.uploadProductImage(f.buffer, f.originalname, subfolder))
    );
  },

  /**
   * Delete an image from Cloudinary by its URL or public ID.
   */
  async deleteProductImage(imageUrlOrPublicId: string): Promise<boolean> {
    if (
      !imageUrlOrPublicId ||
      imageUrlOrPublicId.startsWith("data:") ||
      imageUrlOrPublicId.startsWith("/assets/") ||
      !isCloudinaryConfigured()
    ) {
      return true; // No-op for dev fallback or local assets
    }

    try {
      let publicId = imageUrlOrPublicId;

      if (imageUrlOrPublicId.startsWith("http")) {
        const url = new URL(imageUrlOrPublicId);
        const uploadIndex = url.pathname.indexOf("/upload/");
        if (uploadIndex === -1) return false;

        publicId = url.pathname.substring(uploadIndex + "/upload/".length);
        // Remove version segment e.g. v1234567/
        publicId = publicId.replace(/^v\d+\//, "");
        // Remove extension
        publicId = publicId.replace(/\.[^/.]+$/, "");
      }

      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image"
      });

      return res.result === "ok";
    } catch (err) {
      console.warn("Cloudinary delete error:", err);
      return false;
    }
  },

  /**
   * Clean up old image if a new image was uploaded to replace it.
   */
  async replaceProductImage(
    oldImageUrl: string | undefined | null,
    newFileBuffer: Buffer,
    originalName: string,
    subfolder: string = "products"
  ): Promise<UploadedImageResult> {
    const uploaded = await this.uploadProductImage(newFileBuffer, originalName, subfolder);
    if (oldImageUrl) {
      await this.deleteProductImage(oldImageUrl);
    }
    return uploaded;
  }
};
