import rateLimit from "express-rate-limit";

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes",
  },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many auth attempts, please try again after 15 minutes",
  },
});
