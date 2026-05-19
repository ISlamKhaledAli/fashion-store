import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import httpLogger from "./middleware/httpLogger";
import { generalLimiter } from "./middleware/rateLimiter";
import { env } from "./utils/validateEnv";

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

const app: Application = express();

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
      ];
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use("/api", generalLimiter);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

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

// Catch-all for unmatched routes
app.use((req: Request, res: Response) => {
  console.log(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
