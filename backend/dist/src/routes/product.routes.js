"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const router = (0, express_1.Router)();
router.get("/", product_controller_1.getProducts);
router.get("/filters", product_controller_1.getProductFilters);
router.get("/:slug", product_controller_1.getProductBySlug);
// Admin only routes
router.post("/", auth_1.authMiddleware, admin_1.adminMiddleware, product_controller_1.createProduct);
router.put("/:id", auth_1.authMiddleware, admin_1.adminMiddleware, product_controller_1.updateProduct);
router.delete("/:id", auth_1.authMiddleware, admin_1.adminMiddleware, product_controller_1.deleteProduct);
exports.default = router;
