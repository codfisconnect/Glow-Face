import { apiRequest } from "../api/api";
import { InstagramFeed } from "../../types";
import { BRAND } from "../../constants";

export const socialService = {
  async getInstagramFeed(): Promise<InstagramFeed> {
    try {
      const res = await apiRequest<{ ok: boolean; feed: InstagramFeed }>("/social/instagram");
      return res.feed;
    } catch {
      // Graceful offline fallback with official Glow Face handles
      return {
        source: "FALLBACK",
        showOnHome: true,
        handle: BRAND.instagram.handle,
        profileUrl: BRAND.instagram.url,
        posts: [
          {
            id: "fb_1",
            mediaType: "IMAGE",
            mediaUrl: "/assets/cream-hero.jpg",
            permalink: BRAND.instagram.url,
            caption: "Mindful skincare with pure botanical extracts ✨"
          },
          {
            id: "fb_2",
            mediaType: "IMAGE",
            mediaUrl: "/assets/lip-balm.jpg",
            permalink: BRAND.instagram.url,
            caption: "Soft, hydrated, protected lips 🌿"
          },
          {
            id: "fb_3",
            mediaType: "IMAGE",
            mediaUrl: "/assets/soap.jpg",
            permalink: BRAND.instagram.url,
            caption: "Gentle daily cleansing with natural enzymatic papaya extracts"
          },
          {
            id: "fb_4",
            mediaType: "IMAGE",
            mediaUrl: "/assets/cream-open.jpg",
            permalink: BRAND.instagram.url,
            caption: "Rich, velvet moisture barrier protection"
          }
        ]
      };
    }
  }
};
