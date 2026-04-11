import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import httpLogger from "./middleware/httpLogger";
import { generalRateLimit } from "./middleware/rateLimit";
import { env } from "./utils/validateEnv";

// Import routes
import authRoutes from "./routes/auth.routes";
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

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(httpLogger); // Request logging
app.use(
  cors({
    origin: env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Payment routes BEFORE general json middleware to handle raw body if needed
app.use("/api/payment", paymentRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use("/api", generalRateLimit);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

// Routes initialization
app.use("/api/auth", authRoutes);
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

// Error handling middleware
app.use(errorHandler);

export default app;
