import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import { sendResponse } from "../utils/apiResponse";
import { reviewSchema } from "../validators/review.validator";

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
    return sendResponse({ res, status: 200, success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const validatedData = reviewSchema.parse(req.body);

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: validatedData.productId,
        },
      },
    });

    if (existingReview) {
      return sendResponse({
        res,
        status: 400,
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        ...validatedData,
      },
    });

    return sendResponse({ res, status: 201, success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const validatedData = reviewSchema.partial().parse(req.body);

    const review = await prisma.review.update({
      where: { id, userId },
      data: validatedData,
    });

    return sendResponse({ res, status: 200, success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await prisma.review.delete({
      where: { id, userId },
    });

    return sendResponse({ res, status: 200, success: true, message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};
