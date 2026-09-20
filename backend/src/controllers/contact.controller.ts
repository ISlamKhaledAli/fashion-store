import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import {
  contactFormSchema,
  updateMessageStatusSchema,
} from "../validators/contact.validator";
import { NotFoundError } from "../utils/AppError";
import { getPagination, calculatePagination } from "../utils/pagination";
import { ContactMessageStatus } from "@prisma/client";

export const submitContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = contactFormSchema.parse(req.body);

    const message = await prisma.contactMessage.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject || null,
        message: validatedData.message,
        status: ContactMessageStatus.UNREAD,
      },
    });

    return sendResponse({
      res,
      status: 201,
      success: true,
      data: message,
      message:
        "Your message has been received. Our team will get back to you shortly.",
    });
  } catch (error) {
    next(error);
  }
};

export const getContactMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const status = req.query.status as ContactMessageStatus | undefined;

    const { skip } = getPagination({ page, limit });

    const where: { status?: ContactMessageStatus } = {};
    if (status && Object.values(ContactMessageStatus).includes(status)) {
      where.status = status;
    }

    const [total, messages] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const pagination = calculatePagination(total, page, limit);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: messages,
      pagination,
      message: "Contact messages retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateContactMessageStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateMessageStatusSchema.parse(req.body);

    const existing = await prisma.contactMessage.findUnique({
      where: { id: String(id) },
    });

    if (!existing) {
      return next(new NotFoundError("Contact message not found"));
    }

    const updated = await prisma.contactMessage.update({
      where: { id: String(id) },
      data: {
        status: validatedData.status,
        ...(validatedData.notes !== undefined && {
          notes: validatedData.notes,
        }),
      },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: updated,
      message: "Message status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const existing = await prisma.contactMessage.findUnique({
      where: { id: String(id) },
    });

    if (!existing) {
      return next(new NotFoundError("Contact message not found"));
    }

    await prisma.contactMessage.delete({
      where: { id: String(id) },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: null,
      message: "Message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
