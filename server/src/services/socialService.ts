import { ENV } from "../config/env.js";
import { devStore } from "../config/devStore.js";
import { InstagramFeed, InstagramPost } from "../types/index.js";

// Cache in memory for 15 minutes to respect Meta Graph API rate limits
let cachedFeed: InstagramFeed | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000;

export class SocialService {
  async getInstagramFeed(): Promise<InstagramFeed> {
    // Check in-memory cache
    const now = Date.now();
    if (cachedFeed && (now - lastFetchTime) < CACHE_TTL_MS) {
      return cachedFeed;
    }

    // 1. Live Meta / Instagram Graph API Query
    if (ENV.INSTAGRAM_ACCESS_TOKEN && ENV.INSTAGRAM_ACCOUNT_ID) {
      try {
        const fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
        const url = `https://graph.instagram.com/v18.0/${ENV.INSTAGRAM_ACCOUNT_ID}/media?fields=${fields}&access_token=${ENV.INSTAGRAM_ACCESS_TOKEN}&limit=8`;

        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (response.ok) {
          const data = await response.json() as any;
          if (Array.isArray(data?.data)) {
            const formatted: InstagramPost[] = data.data.map((item: any) => ({
              id: item.id,
              mediaType: item.media_type, // IMAGE, VIDEO, CAROUSEL_ALBUM
              mediaUrl: item.media_type === "VIDEO" ? (item.thumbnail_url || item.media_url) : item.media_url,
              permalink: item.permalink || `https://instagram.com/${ENV.INSTAGRAM_HANDLE}`,
              caption: item.caption || "",
              timestamp: item.timestamp
            }));

            cachedFeed = {
              source: "LIVE_INSTAGRAM", // Distinct source tag per Rule #10
              handle: `@${ENV.INSTAGRAM_HANDLE}`,
              profileUrl: `https://instagram.com/${ENV.INSTAGRAM_HANDLE}`,
              showOnHome: true,
              posts: formatted
            };
            lastFetchTime = now;
            return cachedFeed;
          }
        } else {
          console.warn("Instagram API returned non-200 status:", response.status);
        }
      } catch (err: any) {
        console.warn("Instagram Graph API fetch error, using graceful brand fallback:", err.message);
      }
    }

    // 2. Curated Editorial Fallback (Explicitly labeled FALLBACK_CONTENT per Rule #10)
    let feedConfig: any = {};
    try {
      feedConfig = JSON.parse(devStore.settings.get("social_feed_config") || "{}");
    } catch {
      feedConfig = {};
    }

    cachedFeed = {
      source: "FALLBACK_CONTENT", // Explicitly identified as fallback
      handle: `@${ENV.INSTAGRAM_HANDLE}`,
      profileUrl: `https://instagram.com/${ENV.INSTAGRAM_HANDLE}`,
      showOnHome: feedConfig.showOnHome !== false,
      posts: [
        {
          id: "fb_1",
          mediaType: "IMAGE",
          mediaUrl: "/assets/cream-hero.jpg",
          permalink: `https://instagram.com/${ENV.INSTAGRAM_HANDLE}`,
          caption: "Visible overnight radiance with clean Kojic Acid & pure Alpha Arbutin ✨"
        },
        {
          id: "fb_2",
          mediaType: "IMAGE",
          mediaUrl: "/assets/lip-balm.jpg",
          permalink: `https://instagram.com/${ENV.INSTAGRAM_HANDLE}`,
          caption: "Deeply conditioned, tinted softness with raw Kerala Cocoa Butter 🌿"
        },
        {
          id: "fb_3",
          mediaType: "IMAGE",
          mediaUrl: "/assets/soap.jpg",
          permalink: `https://instagram.com/${ENV.INSTAGRAM_HANDLE}`,
          caption: "Enzymatic gentle papaya exfoliation for luminous, spotless skin 🧼"
        },
        {
          id: "fb_4",
          mediaType: "IMAGE",
          mediaUrl: "/assets/cream-open.jpg",
          permalink: `https://instagram.com/${ENV.INSTAGRAM_HANDLE}`,
          caption: "Formulated for Indian tropical humidity. Lightweight non-greasy skincare 🌸"
        }
      ]
    };

    lastFetchTime = now;
    return cachedFeed;
  }
}

export const socialService = new SocialService();
