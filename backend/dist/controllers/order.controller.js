"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const server_1 = require("../server");
const apiResponse_1 = require("../utils/apiResponse");
const order_validator_1 = require("../validators/order.validator");
const stripe_1 = require("../services/stripe");
const getOrders = async (req, res, next) => {
    try {
        const orders = await server_1.prisma.order.findMany({
            where: { userId: req.user?.id },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: orders });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrders = getOrders;
const getOrderById = async (req, res, next) => {
    try {
        const order = await server_1.prisma.order.findUnique({
            where: { id: String(req.params.id) },
            include: {
                items: { include: { product: true, variant: true } },
                address: true,
            },
        });
        if (!order || order.userId !== req.user?.id) {
            return (0, apiResponse_1.sendResponse)({ res, status: 404, success: false, message: "Order not found" });
        }
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
const createOrder = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { addressId, notes } = order_validator_1.createOrderSchema.parse(req.body);
        // 1. Get cart items
        const cart = await server_1.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: { include: { product: true } },
                    },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            return (0, apiResponse_1.sendResponse)({ res, status: 400, success: false, message: "Cart is empty" });
        }
        // 2. Check stock and calculate totals
        let subtotal = 0;
        for (const item of cart.items) {
            if (item.variant.stock < item.quantity) {
                return (0, apiResponse_1.sendResponse)({
                    res,
                    status: 400,
                    success: false,
                    message: `Insufficient stock for ${item.variant.product.name} (${item.variant.size}/${item.variant.color})`,
                });
            }
            subtotal += item.variant.product.price * item.quantity;
        }
        const shipping = 10; // Fixed for now
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + shipping + tax;
        // 3. Create order in transaction
        const order = await server_1.prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    addressId,
                    subtotal,
                    shipping,
                    tax,
                    total,
                    notes,
                    items: {
                        create: cart.items.map((item) => ({
                            variantId: item.variantId,
                            productId: item.variant.productId,
                            quantity: item.quantity,
                            price: item.variant.product.price,
                        })),
                    },
                },
            });
            // Update stocks
            for (const item of cart.items) {
                await tx.variant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } },
                });
            }
            // Clear cart
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            return newOrder;
        });
        // 4. Create Stripe payment intent
        const paymentIntent = await (0, stripe_1.createPaymentIntent)(order.total, "usd", { orderId: order.id });
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 201,
            success: true,
            data: {
                order,
                clientSecret: paymentIntent.client_secret,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await server_1.prisma.order.findUnique({ where: { id: String(id) } });
        if (!order || order.userId !== req.user?.id) {
            return (0, apiResponse_1.sendResponse)({ res, status: 404, success: false, message: "Order not found" });
        }
        if (order.status !== "PENDING") {
            return (0, apiResponse_1.sendResponse)({ res, status: 400, success: false, message: "Only pending orders can be cancelled" });
        }
        await server_1.prisma.order.update({
            where: { id: String(id) },
            data: { status: "CANCELLED" },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Order cancelled" });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelOrder = cancelOrder;
