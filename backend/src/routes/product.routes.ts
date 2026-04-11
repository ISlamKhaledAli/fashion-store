import { Router } from "express";
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getProductFilters } from "../controllers/product.controller";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

router.get("/", getProducts);
router.get("/filters", getProductFilters);
router.get("/:slug", getProductBySlug);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
