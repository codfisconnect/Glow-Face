import express, { Request, Response } from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { getDatabase } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";

// Controllers for backward compatibility
import { paymentController } from "./controllers/paymentController.js";
import { orderController } from "./controllers/orderController.js";

const app = express();

// Security Headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (ENV.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// CORS configuration
const allowedOrigins = [
  ENV.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser agents (Postman, curl, webhooks) or matched origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, or can lock to allowedOrigins
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Razorpay-Signature"]
  })
);

// Capture raw body for webhook verification
app.use(
  express.json({
    limit: "2mb",
    verify: (req: any, res, buf) => {
      if (req.originalUrl && req.originalUrl.includes("/webhook")) {
        req.rawBody = buf.toString("utf8");
      }
    }
  })
);

app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// System Health Diagnostics
app.get("/api/health", (req: Request, res: Response) => {
  const dbStatus = getDatabase().type;
  res.json({
    ok: true,
    service: "Glow Face E-Commerce & Admin API (TypeScript Engine)",
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
    persistence: dbStatus,
    paymentGateway: ENV.RAZORPAY_KEY_ID ? (ENV.RAZORPAY_KEY_ID.startsWith("rzp_live") ? "LIVE" : "TEST_MODE") : "NOT_CONFIGURED"
  });
});

app.get("/api/debug/prisma", async (req, res) => {
  try {
    const db = getDatabase();

    if (db.type !== "prisma") {
      return res.json({
        databaseType: db.type,
        prisma: false,
      });
    }

    const product = await db.db.product.findFirst({
      select: {
        id: true,
        categorySlug: true,
      },
    });

    return res.json({
      databaseType: "prisma",
      prisma: true,
      prismaVersion: "6.19.3",
      categorySlugSupported: true,
      sample: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
      prismaVersion: "6.19.3",
    });
  }
});

// Mount Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/admin/media", mediaRoutes);

// Backward-compatible direct endpoints
app.post("/api/create-order", orderController.createOrder);
app.post("/api/verify-payment", orderController.verifyPayment);
app.post("/api/validate-coupon", paymentController.validateCoupon);

// Centralized Error Handling
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(ENV.PORT, () => {
    console.log(`
┌───────────────────────────────────────────────────────────┐
│              🌿 GLOW FACE E-COMMERCE SERVER               │
│               Strict TypeScript Production                │
├───────────────────────────────────────────────────────────┤
│  🚀 Status:      ONLINE                                   │
│  📍 Port:        ${ENV.PORT}                                     │
│  🗄️ Persistence: ${getDatabase().type.toUpperCase()}                                 │
│  💳 Gateway:     ${ENV.RAZORPAY_KEY_ID ? "CONFIGURED" : "SIMULATION"}                              │
│  🛡️ Environment: ${ENV.NODE_ENV.toUpperCase()}                              │
└───────────────────────────────────────────────────────────┘
    `);
  });
}

export default app;
