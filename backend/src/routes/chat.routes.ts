import { Router, Request, Response, NextFunction } from "express";
import { handleChat } from "../controllers/chat.controller";
import { verifyAccessToken } from "../utils/jwt";
import { chatLimiter } from "../middleware/rateLimiter";
import { sanitizeChat } from "../middleware/sanitizeChat";

// Optional authentication middleware that injects req.user if a token is present,
// but does not throw errors or block guest users if no token is provided.
const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;
  
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded as { id: string; role: string };
    } catch (error) {
      console.log("[DEBUG] Invalid token in chat request. Proceeding as guest.");
    }
  }
  
  next();
};

const router = Router();

router.post("/", chatLimiter, sanitizeChat, optionalAuthMiddleware, handleChat);

export default router;
