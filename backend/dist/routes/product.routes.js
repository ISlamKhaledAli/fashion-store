"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", product_controller_1.getProducts);
router.get("/filters", product_controller_1.getProductFilters);
// Admin route to get full product by ID (must be before /:slug to avoid conflict)
router.get("/admin/:id", auth_1.authMiddleware, auth_2.adminMiddleware, product_controller_1.getProductById);
router.get("/:identifier", product_controller_1.getProductByIdentifier);
// Admin only routes
router.post("/", auth_1.authMiddleware, auth_2.adminMiddleware, product_controller_1.createProduct);
router.put("/:id", auth_1.authMiddleware, auth_2.adminMiddleware, product_controller_1.updateProduct);
router.delete("/:id", auth_1.authMiddleware, auth_2.adminMiddleware, product_controller_1.deleteProduct);
exports.default = router;
