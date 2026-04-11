import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import { sendResponse } from "../utils/apiResponse";
import { addToCartSchema, updateCartItemSchema } from "../validators/common.validator";

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: { where: { isMain: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: userId as string },
        include: { items: true },
      }) as any;
    }

    return sendResponse({ res, status: 200, success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { variantId, quantity } = addToCartSchema.parse(req.body);

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: userId as string } });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        variantId,
        quantity,
      },
    });

    return sendResponse({ res, status: 200, success: true, data: cartItem });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartItemId, quantity } = updateCartItemSchema.parse(req.body);

    const cartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return sendResponse({ res, status: 200, success: true, data: cartItem });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartItemId } = req.params;

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return sendResponse({ res, status: 200, success: true, message: "Item removed from cart" });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return sendResponse({ res, status: 200, success: true, message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};
