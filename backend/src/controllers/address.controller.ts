import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";
import { sendResponse } from "../utils/apiResponse";
import { addressSchema } from "../validators/address.validator";
import { NotFoundError } from "../utils/AppError";

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user?.id },
    });
    return sendResponse({ res, status: 200, success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const validatedData = addressSchema.parse(req.body);

    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...validatedData, userId },
    });

    return sendResponse({ res, status: 201, success: true, data: address });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id as string;
    const validatedData = addressSchema.partial().parse(req.body);

    const existingAddress = await prisma.address.findUnique({
      where: { id: String(id), userId }
    });

    if (!existingAddress) {
      throw new NotFoundError("Address not found");
    }

    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: String(id), userId },
      data: validatedData,
    });

    return sendResponse({ res, status: 200, success: true, data: address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const existingAddress = await prisma.address.findUnique({
      where: { id: String(id), userId }
    });

    if (!existingAddress) {
      throw new NotFoundError("Address not found");
    }

    await prisma.address.delete({
      where: { id: String(id), userId },
    });

    return sendResponse({ res, status: 200, success: true, message: "Address deleted" });
  } catch (error) {
    next(error);
  }
};
