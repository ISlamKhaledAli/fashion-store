import { Router } from "express";
import { getProducts, getProductByIdentifier, getProductById, createProduct, updateProduct, deleteProduct, getProductFilters } from "../controllers/product.controller";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

router.get("/", getProducts);
router.get("/filters", getProductFilters);
// Admin route to get full product by ID (must be before /:slug to avoid conflict)
router.get("/admin/:id", authMiddleware, adminMiddleware, getProductById);
router.get("/:identifier", getProductByIdentifier);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
