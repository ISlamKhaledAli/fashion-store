import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { addToCartSchema, updateCartItemSchema } from "../validators/common.validator";
import { NotFoundError, ValidationError } from "../utils/AppError";
import { calculateOrderTotals, calculateDiscount, SHIPPING_METHODS } from "../utils/pricing";

export const getShippingMethods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return sendResponse({ res, status: 200, success: true, data: SHIPPING_METHODS });
  } catch (error) {
    next(error);
  }
};

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
    if (error instanceof Error && (error as any).code === "P2025") {
      throw new NotFoundError("Cart item not found");
    }
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartItemId } = req.params;

    await prisma.cartItem.delete({
      where: { id: String(cartItemId) },
    });

    return sendResponse({ res, status: 200, success: true, message: "Item removed from cart" });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2025") {
      throw new NotFoundError("Cart item not found");
    }
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

/**
 * POST /api/cart/calculate
 * 
 * Server-authoritative pricing calculation endpoint.
 * The frontend must NEVER compute totals locally — this is the single source of truth.
 * 
 * @route POST /api/cart/calculate
 * @group Cart - Operations about the shopping cart
 * @param {object} req.body - Calculation inputs
 * @param {string} [req.body.shippingMethod=standard] - One of "standard" | "express" | "overnight"
 * @param {string} [req.body.promoCode] - Optional promotional discount code
 * @returns {object} 200 - Calculated pricing breakdown
 * @returns {number} return.subtotal - Sum of (price × quantity) for all cart items
 * @returns {number} return.discountAmount - Applied discount (capped at subtotal)
 * @returns {number} return.discountedSubtotal - subtotal minus discountAmount
 * @returns {number} return.shippingCost - Cost for the chosen shipping method
 * @returns {number} return.tax - 10% tax on discountedSubtotal
 * @returns {number} return.total - Final amount (discountedSubtotal + tax + shipping), rounded to 2 decimals
 */
export const calculateTotals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { shippingMethod = "standard", promoCode } = req.body || {};

    // 1. Read server-side cart
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

    let subtotal = 0;
    if (cart && cart.items.length > 0) {
      for (const item of cart.items) {
        subtotal += item.variant.product.price * item.quantity;
      }
    } else {
      throw new ValidationError("Your cart is empty");
    }

    // 2. Validate promo code against DB if provided
    let rawDiscountAmount = 0;
    if (promoCode) {
      const discountRecord = await prisma.discount.findUnique({ where: { code: promoCode } });
      if (discountRecord) {
        const result = calculateDiscount(subtotal, discountRecord);
        if (result.isValid) {
          rawDiscountAmount = result.discountAmount;
        }
      }
    }


    // 3. Single canonical calculation
    const totals = calculateOrderTotals({
      subtotal,
      discountAmount: rawDiscountAmount,
      shippingMethod,
    });

    return sendResponse({ res, status: 200, success: true, data: totals });
  } catch (error) {
    next(error);
  }
};
