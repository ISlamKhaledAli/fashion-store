import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import { sendResponse } from "../utils/apiResponse";
import { verifyStripeWebhook } from "../services/stripe";

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = verifyStripeWebhook(req.body, sig);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as any;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        await prisma.order.update({
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
      const failedIntent = event.data.object as any;
      const failedOrderId = failedIntent.metadata.orderId;

      if (failedOrderId) {
        await prisma.order.update({
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
