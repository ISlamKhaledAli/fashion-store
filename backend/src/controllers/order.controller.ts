import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import { sendResponse } from "../utils/apiResponse";
import { createOrderSchema } from "../validators/order.validator";
import { createPaymentIntent } from "../services/stripe";

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
      where: { id: req.params.id },
      include: {
        items: { include: { product: true, variant: true } },
        address: true,
      },
    });

    if (!order || order.userId !== req.user?.id) {
      return sendResponse({ res, status: 404, success: false, message: "Order not found" });
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

    // 1. Get cart items
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
      return sendResponse({ res, status: 400, success: false, message: "Cart is empty" });
    }

    // 2. Check stock and calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        return sendResponse({
          res,
          status: 400,
          success: false,
          message: `Insufficient stock for ${item.variant.product.name} (${item.variant.size}/${item.variant.color})`,
        });
      }
      subtotal += item.variant.product.price * item.quantity;
    }

    const shipping = 10; // Fixed for now
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    // 3. Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
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

      // Update stocks
      for (const item of cart.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
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
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.userId !== req.user?.id) {
      return sendResponse({ res, status: 404, success: false, message: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return sendResponse({ res, status: 400, success: false, message: "Only pending orders can be cancelled" });
    }

    await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return sendResponse({ res, status: 200, success: true, message: "Order cancelled" });
  } catch (error) {
    next(error);
  }
};
