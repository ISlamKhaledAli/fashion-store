import { Router } from "express";
import { optionalAuthMiddleware } from "../middleware/auth";
import { getProductRecommendations } from "../controllers/recommendation.controller";

const router = Router();

router.get("/:id/recommendations", optionalAuthMiddleware, getProductRecommendations);

export default router;
