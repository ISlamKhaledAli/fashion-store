import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});
