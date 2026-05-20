import { Router } from "express";
import { generateDescription, generateAccordionContent } from "../controllers/adminAi.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post("/generate-description", generateDescription);
router.post("/generate-accordion", generateAccordionContent);

export default router;
