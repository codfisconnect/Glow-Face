import { getAuthToken } from "../api/api";

export interface MediaUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  bytes?: number;
}

export const mediaService = {
  async uploadImage(file: File, folder: string = "products"): Promise<MediaUploadResult> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    const token = getAuthToken();
    const res = await fetch("/api/media/upload", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Image upload failed" }));
      throw new Error(err.message || "Image upload failed");
    }

    const data = await res.json();
    return data.image;
  },

  async uploadMultipleImages(files: File[], folder: string = "products"): Promise<MediaUploadResult[]> {
    const formData = new FormData();
    files.forEach(f => formData.append("images", f));
    formData.append("folder", folder);

    const token = getAuthToken();
    const res = await fetch("/api/media/upload-multiple", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Multiple image upload failed" }));
      throw new Error(err.message || "Multiple image upload failed");
    }

    const data = await res.json();
    return data.images;
  },

  async deleteImage(urlOrPublicId: string): Promise<boolean> {
    const token = getAuthToken();
    const res = await fetch("/api/media/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ url: urlOrPublicId })
    });

    if (!res.ok) return false;
    const data = await res.json();
    return data.deleted;
  }
};
