"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = void 0;
const prisma_1 = require("../lib/prisma");
const stripe_1 = require("../services/stripe");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = require("../utils/AppError");
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
