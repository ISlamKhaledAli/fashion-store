import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", getCategories);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createCategory);
router.put("/:id", authMiddleware, adminMiddleware, updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

export default router;
