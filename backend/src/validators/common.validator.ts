import { z } from "zod";

export const addToCartSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1, "Cart Item ID is required"),
  quantity: z.number().int().positive(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  image: z.string().url().optional().or(z.literal("")),
  parentId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "HIDDEN"]).optional(),
  position: z.number().int().optional(),
});

export const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  logo: z.string().url().optional().or(z.literal("")),
  description: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const createDiscountSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive(),
  minOrder: z.number().optional(),
  maxUses: z.number().int().optional(),
  expiresAt: z.string().optional().transform(v => v ? new Date(v) : undefined),
  isActive: z.boolean().default(true),
});
