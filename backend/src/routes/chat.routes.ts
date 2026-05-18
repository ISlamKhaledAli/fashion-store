import { Router, Request, Response, NextFunction } from "express";
import { handleChat } from "../controllers/chat.controller";
import { verifyAccessToken } from "../utils/jwt";

// Optional authentication middleware that injects req.user if a token is present,
// but does not throw errors or block guest users if no token is provided.
const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
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

router.post("/", optionalAuthMiddleware, handleChat);

export default router;
