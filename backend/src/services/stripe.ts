import Stripe from "stripe";
import { env } from "../utils/validateEnv";
import logger from "../utils/logger";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia" as any,
});

export const createPaymentIntent = async (amount: number, currency: string = "usd", metadata: any = {}) => {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe works in cents
    currency,
    metadata,
  });
};

export const verifyStripeWebhook = (payload: any, signature: string) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
};

export default stripe;
