import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import httpLogger from "./middleware/httpLogger";
import { generalLimiter } from "./middleware/rateLimiter";
import { env } from "./utils/validateEnv";
import logger from "./utils/logger";
import { prisma } from "./lib/prisma";
import { sendResponse } from "./utils/apiResponse";

// Import routes
import authRoutes from "./routes/auth.routes";
import recommendationRoutes from "./routes/recommendation.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import brandRoutes from "./routes/brand.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import addressRoutes from "./routes/address.routes";
import uploadRoutes from "./routes/upload.routes";
import adminRoutes from "./routes/admin.routes";
import discountRoutes from "./routes/discount.routes";
import chatRoutes from "./routes/chat.routes";
import sizeRoutes from "./routes/size.routes";
import adminAiRoutes from "./routes/adminAi.routes";
import contentRoutes from "./routes/content.routes";
import contactRoutes from "./routes/contact.routes";
import newsletterRoutes from "./routes/newsletter.routes";
import rentalRoutes from "./routes/rental.routes";
import returnRoutes from "./routes/return.routes";
import notificationRoutes from "./routes/notification.routes";
import bannerRoutes from "./routes/banner.routes";
import compression from "compression";
import { randomUUID } from "crypto";

const app: Application = express();

// Assign unique correlation ID to each request for end-to-end tracing
app.use((req: Request, res: Response, next) => {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  (req as any).id = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
});

// Gzip / Deflate response compression
app.use(compression());

// Security middleware
app.use(helmet());
app.use(httpLogger); // Request logging
app.use(cookieParser()); // Enable cookie parsing
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        env.CLIENT_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ];
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Payment webhook needs raw body — mount BEFORE json middleware
app.use("/api/payment", paymentRoutes);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Rate limiting
app.use("/api", generalLimiter);

// Deep Health check (checks database connectivity, latency, uptime, memory)
const handleHealthCheck = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Server and database are healthy",
      data: {
        status: "healthy",
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          status: "connected",
          latencyMs,
        },
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Health check failed:", { error });
    return sendResponse({
      res,
      status: 503,
      success: false,
      message: "Database connection failed",
      data: {
        status: "degraded",
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          status: "disconnected",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
    });
  }
};

app.get("/health", handleHealthCheck);
app.get("/api/health", handleHealthCheck);

// Routes initialization
app.use("/api/auth", authRoutes);
app.use("/api/products", recommendationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/size", sizeRoutes);
app.use("/api/admin/ai", adminAiRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/banners", bannerRoutes);

// Catch-all for unmatched routes
app.use((req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
