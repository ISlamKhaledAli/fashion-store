import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validators/common.validator";
import { NotFoundError, ValidationError } from "../utils/AppError";
import { isNotFoundError } from "../utils/prismaErrors";
import {
  calculateOrderTotals,
  calculateDiscount,
  SHIPPING_METHODS,
} from "../utils/pricing";

export const getShippingMethods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return sendResponse({
      res,
      status: 200,
      success: true,
      data: SHIPPING_METHODS,
    });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      cart = (await prisma.cart.create({
        data: { userId: userId as string },
        include: { items: true },
      })) as any;
    }

    return sendResponse({ res, status: 200, success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { variantId, quantity } = addToCartSchema.parse(req.body);

    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!variant) {
      throw new NotFoundError("Variant not found");
    }
    if (variant.product.isSaleable === false) {
      throw new ValidationError(
        "This archival piece is exclusively available for rental"
      );
    }

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

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cartItemId, quantity } = updateCartItemSchema.parse(req.body);

    const cartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return sendResponse({ res, status: 200, success: true, data: cartItem });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Cart item not found"));
    }
    next(error);
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cartItemId } = req.params;

    await prisma.cartItem.delete({
      where: { id: String(cartItemId) },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Cart item not found"));
    }
    next(error);
  }
};

export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Cart cleared",
    });
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
export const calculateTotals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id as string;
    const {
      shippingMethod = "standard",
      promoCode,
      country,
      addressId,
    } = req.body || {};

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

    // 2. Validate promo code or find auto-apply promotion
    let rawDiscountAmount = 0;
    const cartItems = cart.items.map((it) => ({
      productId: it.variant.product.id,
      categoryId: it.variant.product.categoryId,
      price: it.variant.product.price,
      quantity: it.quantity,
    }));

    let effectivePromoCode = promoCode;
    if (!effectivePromoCode) {
      const autoDiscount = await prisma.discount.findFirst({
        where: {
          isActive: true,
          autoApply: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { value: "desc" },
      });
      if (autoDiscount) {
        effectivePromoCode = autoDiscount.code;
      }
    }

    if (effectivePromoCode) {
      const discountRecord = await prisma.discount.findUnique({
        where: { code: effectivePromoCode },
      });
      if (discountRecord) {
        const result = calculateDiscount(subtotal, discountRecord, cartItems);
        if (result.isValid) {
          rawDiscountAmount = result.discountAmount;
        }
      }
    }

    // 3. Dynamic shipping calculation based on ShippingZones and StoreSettings
    let customShippingRate: number | undefined = undefined;
    let destinationCountry = (country as string | undefined)?.trim();

    if (!destinationCountry && addressId) {
      const address = await prisma.address.findUnique({
        where: { id: String(addressId) },
      });
      if (address) {
        destinationCountry = address.country?.trim();
      }
    }

    if (destinationCountry) {
      const code = destinationCountry.toUpperCase();
      const activeZones = await prisma.shippingZone.findMany({
        where: { isActive: true },
      });
      const matchingZone = activeZones.find((z) => {
        if (Array.isArray(z.countries)) {
          return (z.countries as string[]).some(
            (c) => String(c).trim().toUpperCase() === code
          );
        }
        return false;
      });

      if (matchingZone) {
        if (
          matchingZone.freeAbove !== null &&
          subtotal >= matchingZone.freeAbove
        ) {
          customShippingRate = 0;
        } else if (
          shippingMethod === "express" &&
          matchingZone.expressRate !== null
        ) {
          customShippingRate = matchingZone.expressRate;
        } else {
          customShippingRate = matchingZone.standardRate;
        }
      } else {
        // Fallback to StoreSettings thresholds
        const settings = await prisma.storeSettings.findMany({
          where: {
            key: {
              in: [
                "freeShippingThreshold",
                "domesticShippingFee",
                "internationalShippingFee",
              ],
            },
          },
        });
        const settingsMap: Record<string, number> = {};
        for (const s of settings) {
          if (typeof s.value === "number") {
            settingsMap[s.key] = s.value;
          }
        }

        const freeThreshold = settingsMap["freeShippingThreshold"];
        if (freeThreshold !== undefined && subtotal >= freeThreshold) {
          customShippingRate = 0;
        } else if (
          code === "EG" &&
          settingsMap["domesticShippingFee"] !== undefined
        ) {
          customShippingRate = settingsMap["domesticShippingFee"];
        } else if (settingsMap["internationalShippingFee"] !== undefined) {
          customShippingRate = settingsMap["internationalShippingFee"];
        }
      }
    }

    // 4. Single canonical calculation
    const totals = calculateOrderTotals({
      subtotal,
      discountAmount: rawDiscountAmount,
      shippingMethod,
      customShippingRate,
    });

    return sendResponse({ res, status: 200, success: true, data: totals });
  } catch (error) {
    next(error);
  }
};
