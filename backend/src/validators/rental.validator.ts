import { z } from "zod";

export const createRentalSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  rentalPeriodId: z.string().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid start date is required",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid end date is required",
  }),
  fulfillment: z.enum(["DELIVERY", "STORE_PICKUP"]).default("DELIVERY"),
  pickupLocation: z.string().optional(),
  addressId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateRentalStatusSchema = z.object({
  status: z.enum([
    "RESERVED",
    "ACTIVE",
    "RETURN_PENDING",
    "RETURNED",
    "OVERDUE",
    "CANCELLED",
  ]),
  notes: z.string().optional(),
  lateFee: z.number().min(0).optional(),
});

export const createRentalPeriodSchema = z.object({
  label: z.string().min(1, "Label is required"),
  days: z.number().int().min(1, "Days must be at least 1"),
  price: z.number().positive("Price must be greater than 0"),
  isActive: z.boolean().default(true),
});

export const returnRentalSchema = z.object({
  notes: z.string().optional(),
});
