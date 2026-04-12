"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntent = exports.stripeWebhook = void 0;
const prisma_1 = require("../lib/prisma");
const stripe_1 = require("../services/stripe");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = require("../utils/AppError");
const apiResponse_1 = require("../utils/apiResponse");
const stripeWebhook = async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = (0, stripe_1.verifyStripeWebhook)(req.body, sig);
    }
    catch (err) {
        logger_1.default.error("Webhook signature verification failed:", { message: err.message });
        throw new AppError_1.ValidationError(`Webhook Error: ${err.message}`);
    }
    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;
            if (orderId) {
                await prisma_1.prisma.order.update({
                    where: { id: orderId },
                    data: {
                        paymentStatus: "PAID",
                        status: "PROCESSING",
                        stripePaymentId: paymentIntent.id,
                    },
                });
                logger_1.default.info(`Order ${orderId} marked as PAID`);
            }
            break;
        case "payment_intent.payment_failed":
            const failedIntent = event.data.object;
            const failedOrderId = failedIntent.metadata.orderId;
            if (failedOrderId) {
                await prisma_1.prisma.order.update({
                    where: { id: failedOrderId },
                    data: { paymentStatus: "FAILED" },
                });
                logger_1.default.error(`Order ${failedOrderId} payment FAILED`);
            }
            break;
        default:
            logger_1.default.info(`Unhandled event type ${event.type}`);
    }
    res.json({ success: true, received: true });
};
exports.stripeWebhook = stripeWebhook;
const createIntent = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { amount: clientAmount } = req.body || {};
        let subtotal = 0;
        let itemsCount = 0;
        // 1. Try to get cart from database first (server-authoritative)
        const cart = await prisma_1.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: { include: { product: true } },
                    },
                },
            },
        });
        if (cart && cart.items.length > 0) {
            // Use server-side cart
            for (const item of cart.items) {
                subtotal += item.variant.product.price * item.quantity;
            }
            itemsCount = cart.items.length;
        }
        else if (clientAmount && typeof clientAmount === "number" && clientAmount > 0) {
            // Fallback: use client-provided amount (Zustand cart)
            subtotal = clientAmount;
            itemsCount = 1; // placeholder
        }
        else {
            throw new AppError_1.ValidationError("Your cart is empty");
        }
        // 2. Calculate totals
        const shipping = 10;
        const tax = subtotal * 0.1;
        const total = subtotal + shipping + tax;
        // 3. Create Stripe payment intent
        const paymentIntent = await (0, stripe_1.createPaymentIntent)(total, "usd", {
            userId,
            itemsCount: itemsCount.toString()
        });
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 200,
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                total,
                subtotal,
                shipping,
                tax
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createIntent = createIntent;
