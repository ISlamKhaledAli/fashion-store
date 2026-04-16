import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  shippingMethod: z.enum(["standard", "express", "overnight"]).default("standard"),
  promoCode: z.string().optional(),
  subtotal: z.number().optional(),
  shipping: z.number().optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
  stripePaymentId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    variantId: z.string(),
    productId: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});
