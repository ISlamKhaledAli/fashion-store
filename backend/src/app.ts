import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorMiddleware } from "./middleware/error";

// Import routes (to be created)
// import authRoutes from "./routes/auth.routes";

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});
app.use("/api", limiter);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

// Routes initialization (commented out until routes are created)
// app.use("/api/auth", authRoutes);

// Error handling middleware (to be created)
app.use(errorMiddleware);

export default app;
