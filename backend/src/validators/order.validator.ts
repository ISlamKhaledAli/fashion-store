import { z } from "zod";
import { SHIPPING_METHODS } from "../utils/pricing";

const shippingMethodIds = SHIPPING_METHODS.map(m => m.id) as [string, ...string[]];

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  shippingMethod: z.enum(shippingMethodIds).default("standard"),
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
    quantity: z.number().int().min(1, "Quantity must be at least 1").max(100, "Quantity cannot exceed 100 per item"),
    price: z.number(),
  })).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});
