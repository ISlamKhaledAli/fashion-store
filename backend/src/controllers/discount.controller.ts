import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/AppError";

export const validateDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      throw new ValidationError("Discount code is required");
    }

    const discount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount || !discount.isActive) {
      return sendResponse({
        res,
        status: 200,
        success: true,
        data: { valid: false, message: "Invalid or inactive discount code" },
      });
    }

    // Check expiry
    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      return sendResponse({
        res,
        status: 200,
        success: true,
        data: { valid: false, message: "Discount code has expired" },
      });
    }

    // Check usage limits
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return sendResponse({
        res,
        status: 200,
        success: true,
        data: { valid: false, message: "Discount code limit reached" },
      });
    }

    // Check minimum order
    if (discount.minOrder && orderTotal < discount.minOrder) {
      return sendResponse({
        res,
        status: 200,
        success: true,
        data: { 
          valid: false, 
          message: `Minimum order amount for this code is $${discount.minOrder}` 
        },
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === "PERCENTAGE") {
      discountAmount = orderTotal * (discount.value / 100);
    } else {
      discountAmount = Math.min(discount.value, orderTotal);
    }

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        valid: true,
        type: discount.type,
        value: discount.value,
        discountAmount,
        code: discount.code,
      },
    });
  } catch (error) {
    next(error);
  }
};
