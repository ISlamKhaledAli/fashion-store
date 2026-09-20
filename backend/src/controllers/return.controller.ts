import { Request, Response, NextFunction } from "express";
import { ReturnStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import {
  createReturnSchema,
  updateReturnStatusSchema,
} from "../validators/return.validator";
import stripe from "../services/stripe";
import logger from "../utils/logger";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} from "../utils/AppError";

// Customer: Create return request
export const createReturnRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ForbiddenError("Authentication required");
    }

    const data = createReturnSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.userId !== userId) {
      throw new ForbiddenError("Order does not belong to you");
    }

    if (order.status !== "DELIVERED" && order.status !== "SHIPPED") {
      throw new ValidationError(
        "Return requests can only be filed for shipped or delivered orders"
      );
    }

    // Check if pending return request exists
    const existing = await prisma.returnRequest.findFirst({
      where: {
        orderId: data.orderId,
        status: { in: [ReturnStatus.PENDING, ReturnStatus.APPROVED] },
      },
    });

    if (existing) {
      throw new ConflictError(
        "A return request is already in progress for this order"
      );
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: data.orderId,
        userId,
        reason: data.reason,
        description: data.description || null,
        images: data.images || [],
        status: ReturnStatus.PENDING,
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: { include: { images: true } },
                variant: true,
              },
            },
          },
        },
      },
    });

    // Notify admins
    await prisma.notification.create({
      data: {
        type: "RETURN_REQUEST",
        title: "New Order Return Request",
        message: `Customer requested a return for Order #${order.id.slice(-6)}`,
        data: {
          orderId: order.id,
          returnRequestId: returnRequest.id,
          reason: data.reason,
        },
      },
    });

    return sendResponse({
      res,
      status: 201,
      success: true,
      message: "Return request submitted successfully",
      data: returnRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Customer: Get my returns
export const getUserReturns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ForbiddenError("Authentication required");
    }

    const returns = await prisma.returnRequest.findMany({
      where: { userId },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: { include: { images: true } },
                variant: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: returns,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all return requests with filters and pagination
export const getAdminReturns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 20)
    );
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (
      status &&
      Object.values(ReturnStatus).includes(status as ReturnStatus)
    ) {
      where.status = status as ReturnStatus;
    }

    const [returns, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          order: {
            include: {
              items: {
                include: {
                  product: { include: { images: true } },
                  variant: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.returnRequest.count({ where }),
    ]);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: returns,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update return request status
export const updateReturnStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const data = updateReturnStatusSchema.parse(req.body);

    const existing = await prisma.returnRequest.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!existing) {
      throw new NotFoundError("Return request not found");
    }

    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: data.status,
        adminNotes: data.adminNotes ?? existing.adminNotes,
        refundAmount: data.refundAmount ?? existing.refundAmount,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: existing.userId,
        type: "RETURN_UPDATE",
        title: `Return Request ${data.status}`,
        message: `Your return request for Order #${existing.orderId.slice(-6)} has been marked as ${data.status}.`,
        data: { returnRequestId: id, status: data.status },
      },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: `Return request marked as ${data.status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Execute Stripe refund for return
export const processReturnRefund = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const { amount } = req.body;

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!returnRequest) {
      throw new NotFoundError("Return request not found");
    }

    const refundAmount = amount ? Number(amount) : returnRequest.order.total;

    let stripeRefundId: string | null = null;
    if (returnRequest.order.stripePaymentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: returnRequest.order.stripePaymentId,
          amount: Math.round(refundAmount * 100),
        });
        stripeRefundId = refund.id;
      } catch (err) {
        logger.error("Stripe refund failed:", err);
        throw new ValidationError(
          "Failed to process refund through Stripe: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
      }
    }

    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: ReturnStatus.REFUNDED,
        refundAmount,
        stripeRefundId,
      },
    });

    // Also update order status if full refund
    if (refundAmount >= returnRequest.order.total) {
      await prisma.order.update({
        where: { id: returnRequest.orderId },
        data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
      });
    }

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: returnRequest.userId,
        type: "REFUND_PROCESSED",
        title: "Refund Processed",
        message: `A refund of $${refundAmount.toFixed(2)} has been processed for your returned items.`,
        data: { returnRequestId: id, refundAmount, stripeRefundId },
      },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Refund processed successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
