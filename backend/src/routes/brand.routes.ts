import { Router } from "express";
import { getBrands, createBrand, updateBrand, deleteBrand } from "../controllers/brand.controller";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", getBrands);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createBrand);
router.put("/:id", authMiddleware, adminMiddleware, updateBrand);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBrand);

export default router;
