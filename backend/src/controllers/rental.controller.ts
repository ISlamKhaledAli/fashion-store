import { Request, Response, NextFunction } from "express";
import { RentalStatus, RentalFulfillment, PaymentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import {
  createRentalSchema,
  returnRentalSchema,
} from "../validators/rental.validator";
import { createPaymentIntent } from "../services/stripe";
import logger from "../utils/logger";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} from "../utils/AppError";

// Check variant rental availability for dates
export const checkAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const variantId = String(req.params.variantId);
    const { startDate, endDate } = req.query;

    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            rentalPeriods: { where: { isActive: true } },
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundError("Variant not found");
    }

    if (!variant.product.isRentable) {
      return sendResponse({
        res,
        status: 200,
        success: true,
        data: {
          isRentable: false,
          available: false,
          reason: "Product is not available for rent",
        },
      });
    }

    let isAvailable = variant.stock > 0;
    let overlappingCount = 0;

    if (startDate && endDate) {
      const start = new Date(String(startDate));
      const end = new Date(String(endDate));

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        throw new ValidationError("Invalid date range specified");
      }

      overlappingCount = await prisma.rental.count({
        where: {
          variantId,
          status: {
            in: [
              RentalStatus.RESERVED,
              RentalStatus.ACTIVE,
              RentalStatus.RETURN_PENDING,
            ],
          },
          startDate: { lte: end },
          endDate: { gte: start },
        },
      });

      isAvailable = overlappingCount < variant.stock;
    }

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        isRentable: true,
        available: isAvailable,
        totalStock: variant.stock,
        activeBookingsInRange: overlappingCount,
        rentalPeriods: variant.product.rentalPeriods,
        dailyPrice: variant.product.rentalPrice,
        securityDeposit: variant.product.securityDeposit || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new rental reservation
export const createRental = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ForbiddenError("Authentication required");
    }

    const data = createRentalSchema.parse(req.body);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end <= start) {
      throw new ValidationError("End date must be after start date");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      throw new ValidationError("Start date cannot be in the past");
    }

    // Verify product & variant
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        rentalPeriods: true,
      },
    });

    if (!product || !product.isRentable) {
      throw new ValidationError("This product is not available for rental");
    }

    const variant = await prisma.variant.findUnique({
      where: { id: data.variantId },
    });

    if (!variant || variant.productId !== product.id) {
      throw new NotFoundError(
        "Selected variant does not belong to this product"
      );
    }

    if (variant.stock <= 0) {
      throw new ConflictError("Item is currently out of stock");
    }

    // Check overlap with existing active rentals
    const overlapping = await prisma.rental.count({
      where: {
        variantId: data.variantId,
        status: {
          in: [
            RentalStatus.RESERVED,
            RentalStatus.ACTIVE,
            RentalStatus.RETURN_PENDING,
          ],
        },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlapping >= variant.stock) {
      throw new ConflictError(
        "Selected dates are already booked for this item"
      );
    }

    // Calculate price
    let rentalPrice = 0;
    if (data.rentalPeriodId) {
      const period = product.rentalPeriods.find(
        (p) => p.id === data.rentalPeriodId
      );
      if (!period || !period.isActive) {
        throw new ValidationError("Invalid rental period selected");
      }
      rentalPrice = period.price;
    } else {
      const days = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      );
      rentalPrice = (product.rentalPrice || 0) * days;
    }

    const securityDeposit = product.securityDeposit || 0;
    const totalAmount = rentalPrice + securityDeposit;

    // Create Stripe payment intent if amount > 0
    let stripePaymentId: string | null = null;
    let clientSecret: string | null = null;

    if (totalAmount > 0) {
      try {
        const paymentIntent = await createPaymentIntent(
          Math.round(totalAmount * 100),
          "usd",
          {
            type: "rental",
            userId,
            productId: product.id,
            variantId: variant.id,
          }
        );
        stripePaymentId = paymentIntent.id;
        clientSecret = paymentIntent.client_secret;
      } catch (err) {
        logger.warn(
          "Could not initialize Stripe for rental, proceeding unpaid:",
          err
        );
      }
    }

    // Create rental and decrement variant stock inside transaction
    const rental = await prisma.$transaction(async (tx) => {
      await tx.variant.update({
        where: { id: variant.id },
        data: { stock: { decrement: 1 } },
      });

      return await tx.rental.create({
        data: {
          userId,
          productId: product.id,
          variantId: variant.id,
          rentalPeriodId: data.rentalPeriodId || null,
          startDate: start,
          endDate: end,
          fulfillment: data.fulfillment as RentalFulfillment,
          pickupLocation:
            data.fulfillment === "STORE_PICKUP"
              ? data.pickupLocation || "Main Fashion Salon"
              : null,
          addressId: data.fulfillment === "DELIVERY" ? data.addressId : null,
          rentalPrice,
          securityDeposit,
          stripePaymentId,
          paymentStatus: PaymentStatus.UNPAID,
          status: RentalStatus.RESERVED,
          notes: data.notes || null,
        },
        include: {
          product: { include: { images: true } },
          variant: true,
          rentalPeriod: true,
          address: true,
        },
      });
    });

    return sendResponse({
      res,
      status: 201,
      success: true,
      message: "Rental reservation created successfully",
      data: {
        rental,
        clientSecret,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's rentals
export const getUserRentals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ForbiddenError("Authentication required");
    }

    const rentals = await prisma.rental.findMany({
      where: { userId },
      include: {
        product: { include: { images: true } },
        variant: true,
        rentalPeriod: true,
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: rentals,
    });
  } catch (error) {
    next(error);
  }
};

// Get rental details by ID
export const getRentalById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        product: { include: { images: true } },
        variant: true,
        rentalPeriod: true,
        address: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!rental) {
      throw new NotFoundError("Rental reservation not found");
    }

    if (rental.userId !== req.user?.id && req.user?.role !== "ADMIN") {
      throw new ForbiddenError(
        "You do not have permission to view this rental"
      );
    }

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: rental,
    });
  } catch (error) {
    next(error);
  }
};

// Request return (initiated by user)
export const requestRentalReturn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const data = returnRentalSchema.parse(req.body);

    const rental = await prisma.rental.findUnique({
      where: { id },
    });

    if (!rental) {
      throw new NotFoundError("Rental reservation not found");
    }

    if (rental.userId !== req.user?.id && req.user?.role !== "ADMIN") {
      throw new ForbiddenError("Unauthorized access");
    }

    if (
      rental.status !== RentalStatus.ACTIVE &&
      rental.status !== RentalStatus.OVERDUE
    ) {
      throw new ValidationError(
        "Only active or overdue rentals can be marked for return"
      );
    }

    const updated = await prisma.rental.update({
      where: { id },
      data: {
        status: RentalStatus.RETURN_PENDING,
        notes: data.notes
          ? `${rental.notes || ""}\nReturn Note: ${data.notes}`.trim()
          : rental.notes,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    // Notify admins
    await prisma.notification.create({
      data: {
        type: "RENTAL_RETURN_REQUEST",
        title: "New Rental Return Request",
        message: `Customer requested return for rental #${rental.id.slice(-6)}`,
        data: { rentalId: rental.id },
      },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Return request submitted successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel rental reservation before delivery/pickup
export const cancelRental = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const rental = await prisma.rental.findUnique({
      where: { id },
    });

    if (!rental) {
      throw new NotFoundError("Rental reservation not found");
    }

    if (rental.userId !== req.user?.id && req.user?.role !== "ADMIN") {
      throw new ForbiddenError("Unauthorized access");
    }

    if (rental.status !== RentalStatus.RESERVED) {
      throw new ValidationError("Only reserved rentals can be cancelled");
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Restock variant
      await tx.variant.update({
        where: { id: rental.variantId },
        data: { stock: { increment: 1 } },
      });

      return await tx.rental.update({
        where: { id },
        data: { status: RentalStatus.CANCELLED },
      });
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Rental reservation cancelled and inventory restored",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
