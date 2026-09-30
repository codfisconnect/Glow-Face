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
        description: "Targeted skin brightening, hyperpigmentation correction, and intense overnight barrier renewal.",
        sortOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cat_2",
        name: "Face Wash",
        slug: "face-wash",
        description: "Gentle non-stripping cleansers infused with botanical bioactive antioxidants.",
        sortOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cat_3",
        name: "Sunscreen",
        slug: "sunscreen",
        description: "Ultra-lightweight invisible mineral SPF 50+ broad-spectrum UV protection.",
        sortOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cat_4",
        name: "Hand Wash",
        slug: "hand-wash",
        description: "Nourishing, antibacterial herb-infused foaming hand therapy.",
        sortOrder: 4,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cat_5",
        name: "Lip Care",
        slug: "lip-care",
        description: "Pure botanical butter balms for soft, tinted, protected lips.",
        sortOrder: 5,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cat_6",
        name: "Body Care",
        slug: "body-care",
        description: "Brightening cold-pressed cleansing bars and botanical body washes.",
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
        description: "Our cult-favorite formulation targets stubborn sun tan, dark spots, and post-acne blemishes. Formulated with high-potency Kojic Acid, Alpha Arbutin, and pure cold-pressed Kerala coconut milk fermentation.",
        shortDescription: "Targeted overnight beauty cream for dark spots, blemishes, and uneven tone.",
        benefits: [
          "Visibly fades stubborn sun tan and dark patches",
          "Clinically proven Alpha Arbutin inhibits melanin synthesis",
          "Non-comedogenic, lightweight velvet matte finish",
          "Infused with antioxidant-rich botanical extract complex"
        ],
        keyIngredients: [
          { name: "Kojic Acid (2%)", benefit: "Naturally inhibits tyrosinase enzymes to fade dark spots." },
          { name: "Alpha Arbutin (1.5%)", benefit: "Evens out skin tone and prevents post-inflammatory erythema." },
          { name: "Cold-Pressed Coconut Milk", benefit: "Nourishes the lipid moisture barrier without clogging pores." }
        ],
        ingredients: "Aqua, Cold-Pressed Cocos Nucifera (Coconut) Milk, Kojic Acid Dipalmitate, Alpha Arbutin, Cetearyl Olivate, Sorbitan Olivate, Niacinamide, Glycerin, Caprylic/Capric Triglyceride, Sodium Hyaluronate, Vitamin E Acetate, Ethylhexylglycerin.",
        howToUse: "Cleanse face thoroughly at night. Pat dry. Take a dime-sized amount and gently massage in upward circular motions across face and neck. Use SPF 50 during daytime.",
        whoItsFor: "Ideal for all skin types dealing with tanning, dark spots, hyperpigmentation, or dullness.",
        skinConcerns: "Pigmentation, Melasma, Sun Tan, Uneven Tone",
        rating: 4.9,
        reviewsCount: 1420,
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
        description: "Intense lip hydrator formulated with unrefined raw cocoa butter, organic virgin coconut oil, and beeswax to seal chapped lips with a subtle natural glow.",
        shortDescription: "Ultra-hydrating daily lip recovery balm.",
        benefits: ["Heals peeling and cracked lips", "Subtle, natural glossy sheen", "Free from petroleum, mineral oil, and artificial fragrances"],
        ingredients: "Theobroma Cacao (Cocoa) Seed Butter, Cocos Nucifera Oil, Cera Alba, Tocopherol, Vanilla Planifolia Extract.",
        howToUse: "Glide generously over lips as needed throughout the day and before bedtime.",
        rating: 4.8,
        reviewsCount: 610,
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
        description: "Enriched with enzymatic organic papaya extracts and moisturizing vegetable oils to gently exfoliate dead surface cells, revealing radiant, soft skin.",
        shortDescription: "Enzymatic dead skin exfoliating beauty bar.",
        benefits: ["Natural papain enzymes gently buff away dead skin", "Leaves face and body squeaky clean yet deeply conditioned", "Sulfate-free, triple-milled long lasting bar"],
        ingredients: "Sodium Palmate, Sodium Palm Kernelate, Aqua, Carica Papaya Fruit Extract, Glycerin, Titanium Dioxide, Curcuma Longa Root Extract.",
        howToUse: "Lather with water between wet palms. Apply generously onto wet skin, massage for 60 seconds, and rinse with lukewarm water.",
        rating: 4.7,
        reviewsCount: 430,
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
        description: "A sulfate-free, non-drying balancing foaming cleanser formulated with 3% Niacinamide and soothing Gotu Kola for clarified, sebum-balanced skin.",
        shortDescription: "Balances excess sebum and clears congested pores.",
        benefits: ["Maintains natural skin pH (5.5)", "Tightens pores and minimizes oiliness", "Calms visible redness and active acne"],
        ingredients: "Aqua, Cocamidopropyl Betaine, Sodium Cocoyl Isethionate, Niacinamide, Centella Asiatica Extract, Aloe Barbadensis Leaf Juice, Panthenol.",
        howToUse: "Dispense a small pump onto wet palms. Work into a silky foam and massage across face for 60 seconds. Rinse thoroughly.",
        rating: 4.8,
        reviewsCount: 320,
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
        name: "Glow Face Ultra-Light Mineral Sunscreen SPF 50+ PA++++",
        slug: "mineral-sunscreen-spf-50",
        shortName: "Mineral Sunscreen SPF 50+",
        sku: "GF-MLS-50ML",
        price: 499,
        originalPrice: 799,
        discount: 37,
        stock: 40,
        lowStockThreshold: 10,
        categorySlug: "sunscreen",
        description: "Zero white-cast, 100% mineral hybrid sunscreen offering maximum broad-spectrum UVA & UVB defense with an airy featherweight matte dry-down.",
        shortDescription: "Zero-cast, weightless daily photo-aging defense.",
        benefits: ["Certified PA++++ highest UVA blue-light protection", "Sweat and humidity resistant for tropical climates", "Infused with green tea antioxidants"],
        ingredients: "Aqua, Zinc Oxide, Titanium Dioxide, Isoamyl Laurate, Camellia Sinensis (Green Tea) Leaf Extract, Silica, Tocopherol.",
        howToUse: "Apply generously as the final step of your morning skincare routine, 15 minutes before sun exposure. Reapply every 3 hours.",
        rating: 4.9,
        reviewsCount: 890,
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
        description: "Botanical hand cleanser enriched with neem leaf distillates, tea tree, and Kerala aloe vera to sanitize hands without stripping essential moisture.",
        shortDescription: "Antibacterial moisture-locking daily hand wash.",
        benefits: ["Naturally antibacterial with pure Neem & Tea Tree", "Gentle on frequently washed hands", "Subtle, fresh herbal aromatherapy aroma"],
        ingredients: "Aqua, Decyl Glucoside, Melia Azadirachta (Neem) Leaf Extract, Melaleuca Alternifolia (Tea Tree) Leaf Oil, Aloe Barbadensis, Glycerin.",
        howToUse: "Pump once onto wet hands. Lather thoroughly for 20 seconds covering palms, fingers, and nails. Rinse clean.",
        rating: 4.8,
        reviewsCount: 195,
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
    this.settings.set("storeName", JSON.stringify("Glow Face Skincare"));
    this.settings.set("tagline", JSON.stringify("Clean, Ayurvedic-infused clinical skincare born in Kerala"));
    this.settings.set("supportEmail", JSON.stringify("care@glowface.in"));
    this.settings.set("supportPhone", JSON.stringify("+91 94471 23456"));
    this.settings.set("whatsappNumber", JSON.stringify("+919447123456"));
    this.settings.set("freeShippingThreshold", JSON.stringify(499));
    this.settings.set("standardShippingFee", JSON.stringify(49));
    this.settings.set("lowStockThreshold", JSON.stringify(10));
    this.settings.set("showInstagram", JSON.stringify(true));
    this.settings.set("instagramPostsCount", JSON.stringify(6));
    this.settings.set("instagramHandle", JSON.stringify("glowface_official"));

    console.log("🌱 DevStore seeded successfully for development mode.");
  }
}

export const devStore = new DevStore();
