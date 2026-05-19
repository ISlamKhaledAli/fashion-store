import rateLimit from "express-rate-limit";

// General rate limiter for all /api/* routes: max 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Return the `X-RateLimit-*` headers
  skip: (req) => process.env.NODE_ENV === "development" || req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1",
  message: {
    success: false,
    message: "Too many requests. Please wait before sending more messages.",
  },
  statusCode: 429,
});

// Strict rate limiter for POST /api/chat: max 20 requests per 15 minutes per IP
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Return the `X-RateLimit-*` headers
  skip: (req) => process.env.NODE_ENV === "development" || req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1",
  message: {
    success: false,
    message: "Too many requests. Please wait before sending more messages.",
  },
  statusCode: 429,
});
