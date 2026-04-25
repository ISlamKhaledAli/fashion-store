import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/AppError";
import { calculateDiscount } from "../utils/pricing";

export const validateDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      throw new ValidationError("Discount code is required");
    }

    const discount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount) {
      return sendResponse({
        res,
        status: 200,
        success: true,
        data: { valid: false, message: "Invalid or inactive discount code" },
      });
    }

    const result = calculateDiscount(orderTotal, discount);

    if (!result.isValid) {
      return sendResponse({
        res,
        status: 200,
        success: true,
        data: { valid: false, message: result.message },
      });
    }

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        valid: true,
        type: discount.type,
        value: discount.value,
        discountAmount: result.discountAmount,
        code: discount.code,
      },
    });
  } catch (error) {
    next(error);
  }
};
