import { z } from "zod";

const variantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  colorHex: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
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
});

export const updateProductSchema = createProductSchema.partial().omit({ variants: true }).extend({
  variants: z.array(variantSchema.extend({ id: z.string().optional() })).optional(),
});
