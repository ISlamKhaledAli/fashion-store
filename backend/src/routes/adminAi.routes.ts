import { Router } from "express";
import { generateDescription, generateAccordionContent, analyzeAnalytics, generateFeatures, generateAllAccordions, adminChat } from "../controllers/adminAi.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post("/generate-description", generateDescription);
router.post("/generate-accordion", generateAccordionContent);
router.post("/generate-features", generateFeatures);
router.post("/generate-all-accordions", generateAllAccordions);
router.post("/analyze-analytics", analyzeAnalytics);
router.post("/chat", adminChat);

export default router;
