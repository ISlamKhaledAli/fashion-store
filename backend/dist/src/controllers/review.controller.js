"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.createReview = exports.getProductReviews = void 0;
const server_1 = require("../server");
const apiResponse_1 = require("../utils/apiResponse");
const review_validator_1 = require("../validators/review.validator");
const AppError_1 = require("../utils/AppError");
const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const reviews = await server_1.prisma.review.findMany({
            where: { productId: String(productId) },
            include: { user: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: reviews });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductReviews = getProductReviews;
const createReview = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const validatedData = review_validator_1.reviewSchema.parse(req.body);
        const existingReview = await server_1.prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: validatedData.productId,
                },
            },
        });
        if (existingReview) {
            throw new AppError_1.ConflictError("You have already reviewed this product");
        }
        const review = await server_1.prisma.review.create({
            data: {
                userId,
                ...validatedData,
            },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 201, success: true, data: review });
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
const updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const validatedData = review_validator_1.reviewSchema.partial().parse(req.body);
        const review = await server_1.prisma.review.update({
            where: { id: String(id), userId },
            data: validatedData,
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: review });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Review not found");
        }
        next(error);
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        await server_1.prisma.review.delete({
            where: { id: String(id), userId },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Review deleted" });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Review not found");
        }
        next(error);
    }
};
exports.deleteReview = deleteReview;
