import { apiRequest } from "./api";
import { InstagramFeed } from "../types";

export const socialService = {
  async getInstagramFeed(): Promise<InstagramFeed> {
    try {
      const res = await apiRequest<{ ok: boolean; feed: InstagramFeed }>("/social/instagram");
      return res.feed;
    } catch {
      // Graceful offline fallback
      return {
        source: "FALLBACK",
        showOnHome: true,
        handle: "@glowfacecare",
        profileUrl: "https://instagram.com/glowfacecare",
        posts: [
          {
            id: "fb_1",
            mediaType: "IMAGE",
            mediaUrl: "/assets/cream-hero.jpg",
            permalink: "https://instagram.com/glowfacecare",
            caption: "Overnight radiance with Kojic Acid & Alpha Arbutin ✨"
          },
          {
            id: "fb_2",
            mediaType: "IMAGE",
            mediaUrl: "/assets/lip-balm.jpg",
            permalink: "https://instagram.com/glowfacecare",
            caption: "Soft, hydrated, naturally pink lips 💋"
          }
        ]
      };
    }
  }
};
