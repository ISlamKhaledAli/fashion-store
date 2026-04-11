"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = void 0;
const server_1 = require("../server");
const stripe_1 = require("../services/stripe");
const stripeWebhook = async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = (0, stripe_1.verifyStripeWebhook)(req.body, sig);
    }
    catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;
            if (orderId) {
                await server_1.prisma.order.update({
                    where: { id: orderId },
                    data: {
                        paymentStatus: "PAID",
                        status: "PROCESSING",
                        stripePaymentId: paymentIntent.id,
                    },
                });
                console.log(`Order ${orderId} marked as PAID`);
            }
            break;
        case "payment_intent.payment_failed":
            const failedIntent = event.data.object;
            const failedOrderId = failedIntent.metadata.orderId;
            if (failedOrderId) {
                await server_1.prisma.order.update({
                    where: { id: failedOrderId },
                    data: { paymentStatus: "FAILED" },
                });
                console.log(`Order ${failedOrderId} payment FAILED`);
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
};
exports.stripeWebhook = stripeWebhook;
