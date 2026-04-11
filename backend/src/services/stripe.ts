import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.patch_1",
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
    process.env.STRIPE_WEBHOOK_SECRET as string
  );
};

export default stripe;
