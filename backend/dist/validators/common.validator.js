"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiscountSchema = exports.brandSchema = exports.categorySchema = exports.updateCartItemSchema = exports.addToCartSchema = void 0;
const zod_1 = require("zod");
exports.addToCartSchema = zod_1.z.object({
    variantId: zod_1.z.string().min(1, "Variant ID is required"),
    quantity: zod_1.z.number().int().positive().default(1),
});
exports.updateCartItemSchema = zod_1.z.object({
    cartItemId: zod_1.z.string().min(1, "Cart Item ID is required"),
    quantity: zod_1.z.number().int().positive(),
});
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    slug: zod_1.z.string().min(1, "Slug is required"),
    image: zod_1.z.string().url().optional(),
    parentId: zod_1.z.string().optional(),
});
exports.brandSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    slug: zod_1.z.string().min(1, "Slug is required"),
    logo: zod_1.z.string().url().optional(),
});
exports.createDiscountSchema = zod_1.z.object({
    code: zod_1.z.string().min(3, "Code must be at least 3 characters"),
    type: zod_1.z.enum(["PERCENTAGE", "FIXED"]),
    value: zod_1.z.number().positive(),
    minOrder: zod_1.z.number().optional(),
    maxUses: zod_1.z.number().int().optional(),
    expiresAt: zod_1.z.string().optional().transform(v => v ? new Date(v) : undefined),
    isActive: zod_1.z.boolean().default(true),
});
