import { Request, Response, NextFunction } from "express";
import { Prisma, ReviewStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { reviewSchema } from "../validators/review.validator";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../utils/AppError";
import { isNotFoundError } from "../utils/prismaErrors";
import { getPagination, calculatePagination } from "../utils/pagination";

export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: {
        productId: String(productId),
        status: ReviewStatus.APPROVED,
      },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
    return sendResponse({ res, status: 200, success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      throw new ConflictError("You have already reviewed this product");
    }

    const review = await prisma.review.create({
      data: {
        userId,
        ...validatedData,
        status: ReviewStatus.APPROVED,
      },
    });

    return sendResponse({ res, status: 201, success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const validatedData = reviewSchema.partial().parse(req.body);

    const review = await prisma.review.update({
      where: { id: String(id), userId },
      data: validatedData,
    });

    return sendResponse({ res, status: 200, success: true, data: review });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Review not found"));
    }
    next(error);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await prisma.review.delete({
      where: { id: String(id), userId },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Review not found"));
    }
    next(error);
  }
};

// --- Admin Review Moderation Controllers ---

export const getAdminReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, rating, search } = req.query;
    const pageNum = Number(req.query.page) || 1;
    const limitNum = Number(req.query.limit) || 10;
    const {
      page: currentPage,
      limit: take,
      skip,
    } = getPagination({
      page: pageNum,
      limit: limitNum,
    });

    const where: Prisma.ReviewWhereInput = {};

    if (status && status !== "ALL") {
      where.status = status as ReviewStatus;
    }

    if (rating && Number(rating) > 0) {
      where.rating = Number(rating);
    }

    if (search) {
      const searchStr = String(search);
      where.OR = [
        { title: { contains: searchStr, mode: "insensitive" } },
        { body: { contains: searchStr, mode: "insensitive" } },
        { user: { name: { contains: searchStr, mode: "insensitive" } } },
        { user: { email: { contains: searchStr, mode: "insensitive" } } },
        { product: { name: { contains: searchStr, mode: "insensitive" } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        take,
        skip,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isMain: true },
                select: { url: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where }),
    ]);

    const pagination = calculatePagination(total, currentPage, take);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: reviews,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      throw new ValidationError("Invalid review status");
    }

    const review = await prisma.review.update({
      where: { id: String(id) },
      data: { status: status as ReviewStatus },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: `Review marked as ${status}`,
      data: review,
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Review not found"));
    }
    next(error);
  }
};

export const replyToReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const review = await prisma.review.update({
      where: { id: String(id) },
      data: { adminReply: reply ? String(reply) : null },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Admin reply updated",
      data: review,
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Review not found"));
    }
    next(error);
  }
};

export const adminDeleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.review.delete({
      where: { id: String(id) },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Review permanently deleted",
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Review not found"));
    }
    next(error);
  }
};
