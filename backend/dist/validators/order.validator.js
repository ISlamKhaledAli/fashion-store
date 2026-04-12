"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    addressId: zod_1.z.string().min(1, "Address is required"),
    subtotal: zod_1.z.number().optional(),
    shipping: zod_1.z.number().optional(),
    tax: zod_1.z.number().optional(),
    total: zod_1.z.number().optional(),
    stripePaymentId: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        variantId: zod_1.z.string(),
        productId: zod_1.z.string(),
        quantity: zod_1.z.number(),
        price: zod_1.z.number(),
    })).optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});
