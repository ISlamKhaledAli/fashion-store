import { z } from "zod";

export const createReturnSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().min(3, "Please provide a reason for the return"),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

export const updateReturnStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "REFUNDED", "RECEIVED"]),
  adminNotes: z.string().optional(),
  refundAmount: z.number().min(0).optional(),
});
