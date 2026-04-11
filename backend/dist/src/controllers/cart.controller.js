"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const common_validator_1 = require("../validators/common.validator");
const AppError_1 = require("../utils/AppError");
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
