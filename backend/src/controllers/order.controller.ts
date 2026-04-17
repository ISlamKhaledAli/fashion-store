import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { createOrderSchema } from "../validators/order.validator";
import { createPaymentIntent } from "../services/stripe";
import stripe from "../services/stripe";
import { calculateOrderTotals } from "../utils/pricing";
import { NotFoundError, ConflictError, ValidationError } from "../utils/AppError";

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user?.id },
      include: { 
        items: { 
          include: { 
            variant: true,
            product: { include: { images: true } } 
          } 
        } 
      },
      orderBy: { createdAt: "desc" },
    });
    return sendResponse({ res, status: 200, success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: {
        items: { include: { product: true, variant: true } },
        address: true,
      },
    });

    if (!order || order.userId !== req.user?.id) {
      throw new NotFoundError("Order not found");
    }

    return sendResponse({ res, status: 200, success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { addressId, notes, stripePaymentId, shippingMethod, promoCode, items: inputItems } = createOrderSchema.parse(req.body);

    let orderItems: any[] = [];

    // 1. Determine Source of Truth for items (Request Body has priority for Zustand/Local carts)
    if (inputItems && inputItems.length > 0) {
      orderItems = inputItems;
    } else {
      // Fallback: Get from database cart
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
        orderItems = cart.items.map(item => ({
          variantId: item.variantId,
          productId: item.variant.productId,
          quantity: item.quantity,
          price: item.variant.product.price
        }));
      }
    }

    if (orderItems.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    // 2. Execute Checkout Transaction
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const finalizedItems = [];

      // Step 1a: Lock variants row explicitly to ensure atomic check-and-decrement validation limits
      const variantIds = orderItems.map(item => item.variantId).sort();
      await tx.$queryRaw`
        SELECT id FROM "variants" 
        WHERE id IN (${Prisma.join(variantIds)}) 
        FOR UPDATE
      `;

      // Step 1a.5: Runtime guard against negative/invalid quantities (Second layer of defense)
      for (const item of orderItems) {
        if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
          throw new ValidationError(`Invalid quantity for item variant: ${item.variantId}`);
        }
      }

      // Step 1b: Verify stock and fetch fresh prices for ALL items
      for (const item of orderItems) {
        const variant = await tx.variant.findUnique({
          where: { id: item.variantId },
          include: { product: true }
        });

        if (!variant) {
          throw new NotFoundError(`Variant ${item.variantId} not found`);
        }

        if (variant.stock < item.quantity) {
          throw new ConflictError(
            `Insufficient stock for ${variant.product.name}`
          );
        }

        const itemPrice = variant.product.price;
        subtotal += itemPrice * item.quantity;

        finalizedItems.push({
          variantId: item.variantId,
          productId: variant.productId,
          quantity: item.quantity,
          price: itemPrice,
        });
      }

      let rawDiscountAmount = 0;
      if (promoCode) {
        const discountRecord = await tx.discount.findUnique({ where: { code: promoCode } });
        if (!discountRecord || !discountRecord.isActive) {
          throw new ValidationError("Invalid promo code");
        }
        if (discountRecord.expiresAt && new Date() > discountRecord.expiresAt) {
          throw new ValidationError("Promo code has expired");
        }
        if (discountRecord.maxUses && discountRecord.usedCount >= discountRecord.maxUses) {
          throw new ValidationError("Promo code usage limit exceeded");
        }
        if (discountRecord.minOrder && subtotal < discountRecord.minOrder) {
          throw new ValidationError(`Promo code requires minimum order of $${discountRecord.minOrder}`);
        }

        if (discountRecord.type.toLowerCase() === "fixed") {
          rawDiscountAmount = discountRecord.value;
        } else if (discountRecord.type.toLowerCase() === "percentage" || discountRecord.type.toLowerCase() === "percent") {
          rawDiscountAmount = subtotal * (discountRecord.value / 100);
        }

        // Increment count
        await tx.discount.update({
          where: { id: discountRecord.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      const totals = calculateOrderTotals({
        subtotal,
        discountAmount: rawDiscountAmount,
        shippingMethod
      });

      // Step 1c: Verify PaymentIntent if provided (Security check)
      if (stripePaymentId) {
        const intent = await stripe.paymentIntents.retrieve(stripePaymentId);
        const expectedAmount = Math.round(totals.total * 100); // cents

        if (intent.amount !== expectedAmount) {
          throw new ValidationError("Payment amount mismatch");
        }
        if (intent.status !== "succeeded") {
          throw new ValidationError("Payment not completed");
        }
        if (intent.metadata.userId !== userId) {
          throw new ValidationError("Payment ownership mismatch");
        }
      }

      // Step 2: Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          subtotal: totals.subtotal,
          // @ts-ignore - Bypass frozen TS dev cache
          discountAmount: totals.discountAmount,
          // @ts-ignore
          promoCode,
          shipping: totals.shippingCost,
          tax: totals.tax,
          total: totals.total,
          notes,
          stripePaymentId,
          paymentStatus: "UNPAID",
          status: "PENDING",
          items: {
            create: finalizedItems
          },
        },
      });

        // Step 3: Decrement stock
        for (const item of finalizedItems) {
          // This must ALWAYS be a decrement with a positive validated quantity
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }

      // Step 4: Clear DB cart (if it exists)
      await tx.cartItem.deleteMany({ 
        where: { 
          cart: { userId } 
        } 
      });

      return newOrder;
    }, {
      timeout: 10000 
    });

    // 3. Handle Payment Intent
    let clientSecret = null;
    if (stripePaymentId) {
      await stripe.paymentIntents.update(stripePaymentId, {
        metadata: { orderId: order.id }
      });
    } else {
      const amountInCents = Math.round(order.total * 100);
      const paymentIntent = await createPaymentIntent(amountInCents, "usd", { orderId: order.id });
      clientSecret = paymentIntent.client_secret;
    }

    return sendResponse({
      res,
      status: 201,
      success: true,
      data: {
        order,
        clientSecret,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id: String(id) } });

    if (!order || order.userId !== req.user?.id) {
      throw new NotFoundError("Order not found");
    }

    if (order.status !== "PENDING") {
      throw new ValidationError("Only pending orders can be cancelled");
    }

    await prisma.order.update({
      where: { id: String(id) },
      data: { status: "CANCELLED" },
    });

    return sendResponse({ res, status: 200, success: true, message: "Order cancelled" });
  } catch (error) {
    next(error);
  }
};
