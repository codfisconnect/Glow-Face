import bcrypt from "bcryptjs";
import { ENV } from "./env.js";
import {
  User,
  Category,
  Product,
  Order,
  Coupon,
  NotificationLogRecord,
  AdminNotification,
  AdminActivity
} from "../types/index.js";

/**
 * Resilient In-Memory Storage Engine for Local Development & Testing
 * (Strictly disabled in production per Rule #4)
 */
export class DevStore {
  users: Map<string, User>;
  categories: Map<string, Category>;
  products: Map<string, Product>;
  orders: Map<string, Order>;
  coupons: Map<string, Coupon>;
  settings: Map<string, string>;
  notificationLogs: NotificationLogRecord[];
  adminNotifications: AdminNotification[];
  adminActivities: AdminActivity[];

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.coupons = new Map();
    this.settings = new Map();
    this.notificationLogs = [];
    this.adminNotifications = [];
    this.adminActivities = [];

    // Only seed in non-production environments
    if (ENV.NODE_ENV !== "production") {
      this.seedDevelopmentData();
    }
  }

  private seedDevelopmentData(): void {
    // 1. Seed Categories
    const categoriesList: Category[] = [
      {
        id: "cat_1",
        name: "Face Cream",
        slug: "face-cream",
        description: "Moisturizing and hydrating daily skincare creams.",
        sortOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cat_2",
        name: "Face Wash",
        slug: "face-wash",
        description: "Gentle daily facial cleansers.",
        sortOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cat_3",
        name: "Sunscreen",
        slug: "sunscreen",
        description: "Daily sun protection formulations.",
        sortOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cat_4",
        name: "Hand Wash",
        slug: "hand-wash",
        description: "Cleansing liquid hand washes.",
        sortOrder: 4,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cat_5",
        name: "Lip Care",
        slug: "lip-care",
        description: "Daily lip balms and care.",
        sortOrder: 5,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cat_6",
        name: "Body Care",
        slug: "body-care",
        description: "Cleansing soap bars and daily body care.",
        sortOrder: 6,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    categoriesList.forEach(c => this.categories.set(c.slug, c));

    // 2. Seed Skincare Products
    const productsList: Product[] = [
      {
        id: "prod_1",
        name: "Glow Face Kojic Acid & Alpha Arbutin Beauty Cream",
        slug: "kojic-acid-beauty-cream",
        shortName: "Kojic Acid Beauty Cream",
        sku: "GF-KAC-50G",
        price: 499,
        originalPrice: 899,
        discount: 44,
        stock: 45,
        lowStockThreshold: 10,
        categorySlug: "face-cream",
        description: "Daily face cream formulated with Kojic Acid and Alpha Arbutin for daily skin hydration and care.",
        shortDescription: "Daily beauty cream with Kojic Acid and Alpha Arbutin.",
        benefits: [
          "Hydrates and softens skin",
          "Lightweight daily facial application",
          "Formulated with Kojic Acid and Alpha Arbutin"
        ],
        keyIngredients: [
          { name: "Kojic Acid", benefit: "Helps promote even skin appearance." },
          { name: "Alpha Arbutin", benefit: "Helps brighten skin appearance." },
          { name: "Coconut Extract", benefit: "Helps moisturize skin." }
        ],
        ingredients: "Aqua, Cocos Nucifera (Coconut) Fruit Extract, Kojic Acid Dipalmitate, Alpha Arbutin, Cetearyl Olivate, Sorbitan Olivate, Niacinamide, Glycerin, Caprylic/Capric Triglyceride, Sodium Hyaluronate, Vitamin E Acetate, Ethylhexylglycerin.",
        howToUse: "Apply a small amount to clean face and neck gently. Use sunscreen during daytime.",
        whoItsFor: "Suitable for daily facial skincare.",
        skinConcerns: "Hydration, Uneven Tone",
        rating: 0,
        reviewsCount: 0,
        featured: true,
        bestSeller: true,
        active: true,
        sortOrder: 1,
        image: "/assets/cream-hero.jpg",
        gallery: ["/assets/cream-hero.jpg", "/assets/cream-open.jpg", "/assets/cream-box.jpg", "/assets/cream-ingred.jpg"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "prod_2",
        name: "Cocoa Butter Nourishing Lip Balm",
        slug: "cocoa-butter-lip-balm",
        shortName: "Cocoa Butter Lip Balm",
        sku: "GF-CBL-15G",
        price: 199,
        originalPrice: 349,
        discount: 43,
        stock: 80,
        lowStockThreshold: 15,
        categorySlug: "lip-care",
        description: "Lip balm formulated with cocoa butter, coconut oil, and beeswax to moisturize dry lips.",
        shortDescription: "Daily moisturizing lip balm.",
        benefits: ["Moisturizes dry lips", "Smooth everyday application", "Made with cocoa butter and coconut oil"],
        ingredients: "Theobroma Cacao (Cocoa) Seed Butter, Cocos Nucifera Oil, Cera Alba, Tocopherol, Vanilla Planifolia Extract.",
        howToUse: "Apply onto lips as needed throughout the day.",
        rating: 0,
        reviewsCount: 0,
        featured: true,
        bestSeller: true,
        active: true,
        sortOrder: 2,
        image: "/assets/lip-balm.jpg",
        gallery: ["/assets/lip-balm.jpg"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "prod_3",
        name: "Papaya Brightening Beauty Soap – 75g",
        slug: "papaya-beauty-soap-75g",
        shortName: "Papaya Beauty Soap",
        sku: "GF-PBS-75G",
        price: 149,
        originalPrice: 249,
        discount: 40,
        stock: 8,
        lowStockThreshold: 10,
        categorySlug: "body-care",
        description: "Vegetable oil soap bar formulated with papaya fruit extract for daily cleansing.",
        shortDescription: "Daily cleansing soap bar with papaya extract.",
        benefits: ["Gently cleanses skin", "Refreshing daily lather", "Formulated with papaya extract"],
        ingredients: "Sodium Palmate, Sodium Palm Kernelate, Aqua, Carica Papaya Fruit Extract, Glycerin, Titanium Dioxide, Curcuma Longa Root Extract.",
        howToUse: "Lather with water between wet palms. Apply onto wet skin, then rinse with water.",
        rating: 0,
        reviewsCount: 0,
        featured: true,
        bestSeller: false,
        active: true,
        sortOrder: 3,
        image: "/assets/soap.jpg",
        gallery: ["/assets/soap.jpg"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "prod_4",
        name: "Glow Face Gentle Niacinamide Face Wash",
        slug: "niacinamide-gentle-face-wash",
        shortName: "Niacinamide Face Wash",
        sku: "GF-NFW-100ML",
        price: 349,
        originalPrice: 599,
        discount: 41,
        stock: 55,
        lowStockThreshold: 10,
        categorySlug: "face-wash",
        description: "Daily foaming facial wash formulated with Niacinamide for gentle cleansing.",
        shortDescription: "Daily gentle facial cleanser.",
        benefits: ["Cleanses impurities without over-drying", "Gentle for daily use", "Formulated with Niacinamide"],
        ingredients: "Aqua, Cocamidopropyl Betaine, Sodium Cocoyl Isethionate, Niacinamide, Centella Asiatica Extract, Aloe Barbadensis Leaf Juice, Panthenol.",
        howToUse: "Apply to wet palms, work into foam, massage onto face, and rinse thoroughly.",
        rating: 0,
        reviewsCount: 0,
        featured: false,
        bestSeller: false,
        active: true,
        sortOrder: 4,
        image: "/assets/cream-hero.jpg",
        gallery: ["/assets/cream-hero.jpg"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "prod_5",
        name: "Glow Face Lightweight Mineral Sunscreen SPF 50",
        slug: "mineral-sunscreen-spf-50",
        shortName: "Mineral Sunscreen SPF 50",
        sku: "GF-MLS-50ML",
        price: 499,
        originalPrice: 799,
        discount: 37,
        stock: 40,
        lowStockThreshold: 10,
        categorySlug: "sunscreen",
        description: "Lightweight daytime facial sunscreen formulation for broad sun protection.",
        shortDescription: "Lightweight daytime sunscreen.",
        benefits: ["Broad daytime sun protection", "Lightweight texture", "Suitable for everyday wear"],
        ingredients: "Aqua, Zinc Oxide, Titanium Dioxide, Isoamyl Laurate, Camellia Sinensis (Green Tea) Leaf Extract, Silica, Tocopherol.",
        howToUse: "Apply generously before sun exposure. Reapply as needed.",
        rating: 0,
        reviewsCount: 0,
        featured: true,
        bestSeller: true,
        active: true,
        sortOrder: 5,
        image: "/assets/cream-box.jpg",
        gallery: ["/assets/cream-box.jpg"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "prod_6",
        name: "Glow Face Herbal Nourishing Hand Wash 250ml",
        slug: "herbal-nourishing-hand-wash",
        shortName: "Herbal Hand Wash",
        sku: "GF-HHW-250ML",
        price: 249,
        originalPrice: 399,
        discount: 37,
        stock: 35,
        lowStockThreshold: 10,
        categorySlug: "hand-wash",
        description: "Herbal hand cleanser enriched with neem leaf and aloe vera extracts for daily hand washing.",
        shortDescription: "Herbal daily hand wash.",
        benefits: ["Gentle hand wash for everyday use", "Leaves hands feeling clean and refreshed", "Formulated with neem and aloe extracts"],
        ingredients: "Aqua, Decyl Glucoside, Melia Azadirachta (Neem) Leaf Extract, Melaleuca Alternifolia (Tea Tree) Leaf Oil, Aloe Barbadensis, Glycerin.",
        howToUse: "Pump onto wet hands, lather well, and rinse clean.",
        rating: 0,
        reviewsCount: 0,
        featured: false,
        bestSeller: false,
        active: true,
        sortOrder: 6,
        image: "/assets/cream-open.jpg",
        gallery: ["/assets/cream-open.jpg"],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    productsList.forEach(p => this.products.set(p.id, p));

    // 3. Seed Coupons (Dynamic Model)
    const couponsList: Coupon[] = [
      {
        id: "coup_1",
        code: "GLOW10",
        description: "10% off entire order",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscount: 500,
        usageLimit: 1000,
        usedCount: 14,
        perCustomerLimit: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "coup_2",
        code: "WELCOME50",
        description: "Flat ₹50 off on orders above ₹499",
        discountType: "FIXED",
        discountValue: 50,
        minOrderAmount: 499,
        usageLimit: 500,
        usedCount: 8,
        perCustomerLimit: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    couponsList.forEach(c => this.coupons.set(c.code.toUpperCase(), c));

    // 4. Seed Development Users (Dev mode only)
    const adminPasswordHash = bcrypt.hashSync("GlowAdmin2026!", 10);
    this.users.set("user_admin", {
      id: "user_admin",
      email: "admin@glowface.com",
      name: "Glow Face Dev Operations",
      phone: "+919876543210",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z")
    });

    const customerPasswordHash = bcrypt.hashSync("Customer123!", 10);
    this.users.set("user_customer_1", {
      id: "user_customer_1",
      email: "priya.sharma@example.com",
      name: "Priya Sharma",
      phone: "+919845012345",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      createdAt: new Date("2026-01-15T00:00:00Z"),
      updatedAt: new Date("2026-01-15T00:00:00Z")
    });

    // 5. Seed Initial Store Settings
    this.settings.set("storeName", JSON.stringify("Glow Face"));
    this.settings.set("tagline", JSON.stringify("Authentic Botanical Formulations for Radiant Skin"));
    this.settings.set("supportEmail", JSON.stringify("glowface.kl@gmail.com"));
    this.settings.set("supportPhone", JSON.stringify("+91 87785 48891"));
    this.settings.set("whatsappNumber", JSON.stringify("+91 87785 48891"));
    this.settings.set("freeShippingThreshold", JSON.stringify(499));
    this.settings.set("standardShippingFee", JSON.stringify(49));
    this.settings.set("lowStockThreshold", JSON.stringify(10));
    this.settings.set("showInstagram", JSON.stringify(true));
    this.settings.set("instagramPostsCount", JSON.stringify(6));
    this.settings.set("instagramHandle", JSON.stringify("@glowface.kl"));

    console.log("🌱 DevStore seeded successfully for development mode.");
  }
}

export const devStore = new DevStore();
