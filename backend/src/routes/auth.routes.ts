import { Router } from "express";
import { register, login, refresh, logout, getMe } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { authRateLimit } from "../middleware/rateLimit";

const router = Router();

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;
