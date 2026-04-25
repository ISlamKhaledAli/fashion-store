"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTotals = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = exports.getShippingMethods = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const common_validator_1 = require("../validators/common.validator");
const AppError_1 = require("../utils/AppError");
const pricing_1 = require("../utils/pricing");
const getShippingMethods = async (req, res, next) => {
    try {
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: pricing_1.SHIPPING_METHODS });
    }
    catch (error) {
        next(error);
    }
};
exports.getShippingMethods = getShippingMethods;
const getCart = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        let cart = await prisma_1.prisma.cart.findUnique({
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
            cart = await prisma_1.prisma.cart.create({
                data: { userId: userId },
                include: { items: true },
            });
        }
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
const addToCart = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { variantId, quantity } = common_validator_1.addToCartSchema.parse(req.body);
        let cart = await prisma_1.prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma_1.prisma.cart.create({ data: { userId: userId } });
        }
        const cartItem = await prisma_1.prisma.cartItem.upsert({
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
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: cartItem });
    }
    catch (error) {
        next(error);
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res, next) => {
    try {
        const { cartItemId, quantity } = common_validator_1.updateCartItemSchema.parse(req.body);
        const cartItem = await prisma_1.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: cartItem });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Cart item not found");
        }
        next(error);
    }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res, next) => {
    try {
        const { cartItemId } = req.params;
        await prisma_1.prisma.cartItem.delete({
            where: { id: String(cartItemId) },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Item removed from cart" });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Cart item not found");
        }
        next(error);
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const cart = await prisma_1.prisma.cart.findUnique({ where: { userId } });
        if (cart) {
            await prisma_1.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Cart cleared" });
    }
    catch (error) {
        next(error);
    }
};
exports.clearCart = clearCart;
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
const calculateTotals = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { shippingMethod = "standard", promoCode } = req.body || {};
        // 1. Read server-side cart
        const cart = await prisma_1.prisma.cart.findUnique({
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
        }
        else {
            throw new AppError_1.ValidationError("Your cart is empty");
        }
        // 2. Validate promo code against DB if provided
        let rawDiscountAmount = 0;
        if (promoCode) {
            const discountRecord = await prisma_1.prisma.discount.findUnique({ where: { code: promoCode } });
            if (discountRecord) {
                const result = (0, pricing_1.calculateDiscount)(subtotal, discountRecord);
                if (result.isValid) {
                    rawDiscountAmount = result.discountAmount;
                }
            }
        }
        // 3. Single canonical calculation
        const totals = (0, pricing_1.calculateOrderTotals)({
            subtotal,
            discountAmount: rawDiscountAmount,
            shippingMethod,
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: totals });
    }
    catch (error) {
        next(error);
    }
};
exports.calculateTotals = calculateTotals;
