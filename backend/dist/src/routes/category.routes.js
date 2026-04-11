"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const router = (0, express_1.Router)();
router.get("/", category_controller_1.getCategories);
// Admin only routes
router.post("/", auth_1.authMiddleware, admin_1.adminMiddleware, category_controller_1.createCategory);
router.put("/:id", auth_1.authMiddleware, admin_1.adminMiddleware, category_controller_1.updateCategory);
router.delete("/:id", auth_1.authMiddleware, admin_1.adminMiddleware, category_controller_1.deleteCategory);
exports.default = router;
