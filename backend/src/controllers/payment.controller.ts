import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { verifyStripeWebhook } from "../services/stripe";
import logger from "../utils/logger";
import { ValidationError } from "../utils/AppError";

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = verifyStripeWebhook(req.body, sig);
  } catch (err: any) {
    logger.error("Webhook signature verification failed:", { message: err.message });
    throw new ValidationError(`Webhook Error: ${err.message}`);
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
        logger.info(`Order ${orderId} marked as PAID`);
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
        logger.error(`Order ${failedOrderId} payment FAILED`);
      }
      break;

    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.json({ success: true, received: true });
};
