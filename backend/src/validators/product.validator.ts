import { z } from "zod";

const variantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  colorHex: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
});

const imageSchema = z.object({
  url: z.string().url("Valid image URL is required"),
  publicId: z.string().min(1, "Public ID is required"),
  isMain: z.boolean().default(false),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  images: z.array(imageSchema).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  comparePrice: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  categoryId: z.string().optional(),
  brandId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    colorHex: z.string().optional().nullable(),
    stock: z.number().int().min(0).optional(),
    sku: z.string().optional(),
  })).optional(),
  images: z.array(z.object({
    id: z.string().optional(),
    url: z.string().optional(),
    publicId: z.string().optional(),
    isMain: z.boolean().optional(),
  })).optional(),
});
