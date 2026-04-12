import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { createOrderSchema } from "../validators/order.validator";
import { createPaymentIntent } from "../services/stripe";
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
    const { addressId, notes, stripePaymentId, items: inputItems } = createOrderSchema.parse(req.body);

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

      // Step 1: Verify stock and fetch fresh prices for ALL items
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

      const shipping = 10;
      const tax = subtotal * 0.1;
      const total = subtotal + shipping + tax;

      // Step 2: Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          subtotal,
          shipping,
          tax,
          total,
          notes,
          stripePaymentId,
          paymentStatus: stripePaymentId ? "PAID" : "UNPAID",
          status: stripePaymentId ? "PROCESSING" : "PENDING",
          items: {
            create: finalizedItems
          },
        },
      });

      // Step 3: Decrement stock
      for (const item of finalizedItems) {
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
    if (!stripePaymentId) {
      const paymentIntent = await createPaymentIntent(order.total, "usd", { orderId: order.id });
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
