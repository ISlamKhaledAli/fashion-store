import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import { sendResponse } from "../utils/apiResponse";
import { createOrderSchema } from "../validators/order.validator";
import { createPaymentIntent } from "../services/stripe";
import { NotFoundError, ConflictError, ValidationError } from "../utils/AppError";

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user?.id },
      include: { items: { include: { product: true } } },
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
    const { addressId, notes } = createOrderSchema.parse(req.body);

    // 1. Get cart items and validate
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

    if (!cart || cart.items.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    // 2. Calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      subtotal += item.variant.product.price * item.quantity;
    }

    const shipping = 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    // 3. Execute Checkout Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Step 1: Verify stock for ALL items
      for (const item of cart.items) {
        // Fetch fresh variant data to ensure stock is accurate at start of transaction
        const variant = await tx.variant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, product: { select: { name: true } } }
        });

        if (!variant || variant.stock < item.quantity) {
          throw new ConflictError(
            `Insufficient stock for ${variant?.product.name || "item"}`
          );
        }
      }

      // Step 2 & 3: Create Order and OrderItems
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          subtotal,
          shipping,
          tax,
          total,
          notes,
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              productId: item.variant.productId,
              quantity: item.quantity,
              price: item.variant.product.price,
            })),
          },
        },
      });

      // Step 4: Decrement stock
      for (const item of cart.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Step 5: Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    }, {
      timeout: 10000 // 10s timeout as requested
    });

    // 4. Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(order.total, "usd", { orderId: order.id });

    return sendResponse({
      res,
      status: 201,
      success: true,
      data: {
        order,
        clientSecret: paymentIntent.client_secret,
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
