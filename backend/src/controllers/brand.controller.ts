import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import { sendResponse } from "../utils/apiResponse";
import { brandSchema } from "../validators/common.validator";
import { NotFoundError } from "../utils/AppError";

export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await prisma.brand.findMany();
    return sendResponse({ res, status: 200, success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = brandSchema.parse(req.body);
    const brand = await prisma.brand.create({ data: validatedData });
    return sendResponse({ res, status: 201, success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = brandSchema.partial().parse(req.body);

    const brand = await prisma.brand.update({
      where: { id: String(id) },
      data: validatedData,
    });
    return sendResponse({ res, status: 200, success: true, data: brand });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2025") {
      throw new NotFoundError("Brand not found");
    }
    next(error);
  }
};

export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.brand.delete({ where: { id: String(id) } });
    return sendResponse({ res, status: 200, success: true, message: "Brand deleted" });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2025") {
      throw new NotFoundError("Brand not found");
    }
    next(error);
  }
};
