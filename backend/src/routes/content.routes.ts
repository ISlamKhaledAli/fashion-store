import { Router } from "express";
import {
  getAllContent,
  getContentByKey,
  upsertContent,
  bulkUpsertContent,
} from "../controllers/content.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", getAllContent);
router.get("/:key", getContentByKey);

// Admin protected routes
router.post("/bulk", authMiddleware, adminMiddleware, bulkUpsertContent);
router.put("/:key", authMiddleware, adminMiddleware, upsertContent);

export default router;
