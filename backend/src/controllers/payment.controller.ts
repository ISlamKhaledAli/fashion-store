import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { verifyStripeWebhook, createPaymentIntent } from "../services/stripe";
import logger from "../utils/logger";
import { ValidationError, NotFoundError } from "../utils/AppError";
import { sendResponse } from "../utils/apiResponse";

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

export const createIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { amount: clientAmount } = req.body || {};

    let subtotal = 0;
    let itemsCount = 0;

    // 1. Try to get cart from database first (server-authoritative)
    const cart = await prisma.cart.findUnique({
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
    } else if (clientAmount && typeof clientAmount === "number" && clientAmount > 0) {
      // Fallback: use client-provided amount (Zustand cart)
      subtotal = clientAmount;
      itemsCount = 1; // placeholder
    } else {
      throw new ValidationError("Your cart is empty");
    }

    // 2. Calculate totals
    const shipping = 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    // 3. Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(total, "usd", { 
      userId,
      itemsCount: itemsCount.toString() 
    });

    return sendResponse({
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
  } catch (error) {
    next(error);
  }
};
