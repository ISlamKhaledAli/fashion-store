"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const brand_controller_1 = require("../controllers/brand.controller");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", brand_controller_1.getBrands);
// Admin only routes
router.post("/", auth_1.authMiddleware, auth_2.adminMiddleware, brand_controller_1.createBrand);
router.put("/:id", auth_1.authMiddleware, auth_2.adminMiddleware, brand_controller_1.updateBrand);
router.delete("/:id", auth_1.authMiddleware, auth_2.adminMiddleware, brand_controller_1.deleteBrand);
exports.default = router;
