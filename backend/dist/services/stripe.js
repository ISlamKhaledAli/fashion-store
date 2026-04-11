"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyStripeWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-03-25.dahlia",
});
const createPaymentIntent = async (amount, currency = "usd", metadata = {}) => {
    return await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe works in cents
        currency,
        metadata,
    });
};
exports.createPaymentIntent = createPaymentIntent;
const verifyStripeWebhook = (payload, signature) => {
    return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
};
exports.verifyStripeWebhook = verifyStripeWebhook;
exports.default = stripe;
