"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const server_1 = require("../server");
const apiResponse_1 = require("../utils/apiResponse");
const AppError_1 = require("../utils/AppError");
const getWishlist = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const wishlist = await server_1.prisma.wishlist.findMany({
            where: { userId },
            include: { product: { include: { images: { where: { isMain: true } } } } },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: wishlist });
    }
    catch (error) {
        next(error);
    }
};
exports.getWishlist = getWishlist;
const addToWishlist = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.body;
        const wishlistItem = await server_1.prisma.wishlist.upsert({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
            update: {},
            create: {
                userId,
                productId,
            },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 201, success: true, data: wishlistItem });
    }
    catch (error) {
        next(error);
    }
};
exports.addToWishlist = addToWishlist;
const removeFromWishlist = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.params;
        await server_1.prisma.wishlist.delete({
            where: {
                userId_productId: {
                    userId,
                    productId: String(productId),
                },
            },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Removed from wishlist" });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Item not found in wishlist");
        }
        next(error);
    }
};
exports.removeFromWishlist = removeFromWishlist;
