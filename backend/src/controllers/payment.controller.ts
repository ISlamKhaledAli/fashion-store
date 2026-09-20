import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import stripe, {
  createPaymentIntent,
  StripeEvent,
  StripePaymentIntent,
} from "../services/stripe";
import { calculateOrderTotals, calculateDiscount } from "../utils/pricing";
import { env } from "../utils/validateEnv";
import { sendResponse } from "../utils/apiResponse";
import { NotFoundError, ValidationError } from "../utils/AppError";
import logger from "../utils/logger";

export const stripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: StripeEvent;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    logger.error(`Webhook signature verification failed: ${errorMsg}`);
    return sendResponse({
      res,
      status: 400,
      success: false,
      message: `Webhook Error: ${errorMsg}`,
    });
  }

  try {
    // Idempotency check: Ignore duplicate events
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { id: event.id },
    });

    if (existingEvent) {
      logger.info(`Webhook event ${event.id} already processed. Skipping.`);
      return sendResponse({
        res,
        status: 200,
        success: true,
        message: "Event already processed",
      });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as StripePaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

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
        const failedIntent = event.data.object as StripePaymentIntent;
        const failedOrderId = failedIntent.metadata?.orderId;

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

    await prisma.webhookEvent.create({
      data: { id: event.id, type: event.type },
    });
    return res.status(200).json({ success: true, received: true });
  } catch (err: any) {
    logger.error("Webhook processing failed:", { message: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id as string;
    const { shippingMethod, promoCode } = req.body || {};

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
    } else {
      throw new ValidationError("Your cart is empty");
    }

    // 2. Validate discount if provided
    let rawDiscountAmount = 0;
    const cartItems = cart.items.map((it) => ({
      productId: it.variant.product.id,
      categoryId: it.variant.product.categoryId,
      price: it.variant.product.price,
      quantity: it.quantity,
    }));

    if (promoCode) {
      const discountRecord = await prisma.discount.findUnique({
        where: { code: promoCode },
      });
      if (discountRecord) {
        const result = calculateDiscount(subtotal, discountRecord, cartItems);
        if (result.isValid) {
          rawDiscountAmount = result.discountAmount;
        }
      }
    }

    const totals = calculateOrderTotals({
      subtotal,
      discountAmount: rawDiscountAmount,
      shippingMethod,
    });

    // 3. Create Stripe payment intent
    const amountInCents = Math.round(totals.total * 100);
    const paymentIntent = await createPaymentIntent(amountInCents, "usd", {
      userId,
      itemsCount: itemsCount.toString(),
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        total: totals.total,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        shipping: totals.shippingCost,
        tax: totals.tax,
      },
    });
  } catch (error) {
    next(error);
  }
};
