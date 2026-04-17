"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyStripeWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const validateEnv_1 = require("../utils/validateEnv");
const stripe = new stripe_1.default(validateEnv_1.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-03-25.dahlia",
});
const createPaymentIntent = async (amount, currency = "usd", metadata = {}) => {
    if (!Number.isInteger(amount))
        throw new Error('PaymentIntent amount must be an integer');
    return await stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
    });
};
exports.createPaymentIntent = createPaymentIntent;
const verifyStripeWebhook = (payload, signature) => {
    return stripe.webhooks.constructEvent(payload, signature, validateEnv_1.env.STRIPE_WEBHOOK_SECRET);
};
exports.verifyStripeWebhook = verifyStripeWebhook;
exports.default = stripe;
