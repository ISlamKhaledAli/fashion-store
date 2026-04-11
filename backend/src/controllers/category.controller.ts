import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { categorySchema } from "../validators/common.validator";
import { NotFoundError } from "../utils/AppError";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });
    return sendResponse({ res, status: 200, success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data: validatedData });
    return sendResponse({ res, status: 201, success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = categorySchema.partial().parse(req.body);

    const category = await prisma.category.update({
      where: { id: String(id) },
      data: validatedData,
    });
    return sendResponse({ res, status: 200, success: true, data: category });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2025") {
      throw new NotFoundError("Category not found");
    }
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: String(id) } });
    return sendResponse({ res, status: 200, success: true, message: "Category deleted" });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2025") {
      throw new NotFoundError("Category not found");
    }
    next(error);
  }
};
