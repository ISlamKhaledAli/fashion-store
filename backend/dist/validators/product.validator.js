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
const imageSchema = zod_1.z.object({
    url: zod_1.z.string().url("Valid image URL is required"),
    publicId: zod_1.z.string().min(1, "Public ID is required"),
    isMain: zod_1.z.boolean().default(false),
});
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive("Price must be positive"),
    comparePrice: zod_1.z.number().optional().nullable(),
    cost: zod_1.z.number().min(0).optional().nullable(),
    categoryId: zod_1.z.string().min(1, "Category is required"),
    brandId: zod_1.z.string().optional(),
    status: zod_1.z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
    featured: zod_1.z.boolean().default(false),
    variants: zod_1.z.array(variantSchema).min(1, "At least one variant is required"),
    images: zod_1.z.array(imageSchema).optional(),
});
exports.updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional().nullable(),
    price: zod_1.z.number().min(0).optional(),
    comparePrice: zod_1.z.number().min(0).optional().nullable(),
    cost: zod_1.z.number().min(0).optional().nullable(),
    categoryId: zod_1.z.string().optional(),
    brandId: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
    featured: zod_1.z.boolean().optional(),
    variants: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().optional(),
        size: zod_1.z.string().optional(),
        color: zod_1.z.string().optional(),
        colorHex: zod_1.z.string().optional().nullable(),
        stock: zod_1.z.number().int().min(0).optional(),
        sku: zod_1.z.string().optional(),
    })).optional(),
    images: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().optional(),
        url: zod_1.z.string().optional(),
        publicId: zod_1.z.string().optional(),
        isMain: zod_1.z.boolean().optional(),
    })).optional(),
});
