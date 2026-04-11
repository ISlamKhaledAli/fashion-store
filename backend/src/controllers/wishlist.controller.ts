import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import { sendResponse } from "../utils/apiResponse";
import { NotFoundError } from "../utils/AppError";

export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: { include: { images: { where: { isMain: true } } } } },
    });
    return sendResponse({ res, status: 200, success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { productId } = req.body;

    const wishlistItem = await prisma.wishlist.upsert({
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

    return sendResponse({ res, status: 201, success: true, data: wishlistItem });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { productId } = req.params;

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId: String(productId),
        },
      },
    });

    return sendResponse({ res, status: 200, success: true, message: "Removed from wishlist" });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2025") {
      throw new NotFoundError("Item not found in wishlist");
    }
    next(error);
  }
};
