"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const variantSchema = zod_1.z.object({
    size: zod_1.z.string().min(1, "Size is required"),
    color: zod_1.z.string().min(1, "Color is required"),
    colorHex: zod_1.z.string().optional(),
    stock: zod_1.z.number().int().min(0, "Stock cannot be negative"),
    sku: zod_1.z.string().min(1, "SKU is required"),
});
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive("Price must be positive"),
    comparePrice: zod_1.z.number().optional(),
    categoryId: zod_1.z.string().min(1, "Category is required"),
    brandId: zod_1.z.string().optional(),
    status: zod_1.z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
    featured: zod_1.z.boolean().default(false),
    variants: zod_1.z.array(variantSchema).min(1, "At least one variant is required"),
});
exports.updateProductSchema = exports.createProductSchema.partial().omit({ variants: true }).extend({
    variants: zod_1.z.array(variantSchema.extend({ id: zod_1.z.string().optional() })).optional(),
});
