import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { NotFoundError } from "../utils/AppError";
import { Prisma } from "@prisma/client";

export const getContentByKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params;
    const content = await prisma.siteContent.findUnique({
      where: { key: String(key) },
    });

    if (!content) {
      return next(new NotFoundError(`Content not found for key: ${key}`));
    }

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: content.data,
      message: "Content retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contents = await prisma.siteContent.findMany();

    // Map array to key-value object for convenient frontend consumption
    const contentMap: Record<string, unknown> = {};
    for (const item of contents) {
      contentMap[item.key] = item.data;
    }

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        items: contents,
        map: contentMap,
      },
      message: "All site content retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const upsertContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params;
    const { data } = req.body;

    if (data === undefined) {
      return sendResponse({
        res,
        status: 400,
        success: false,
        message: "Data field is required",
      });
    }

    const content = await prisma.siteContent.upsert({
      where: { key: String(key) },
      update: {
        data: data as Prisma.InputJsonValue,
      },
      create: {
        key: String(key),
        data: data as Prisma.InputJsonValue,
      },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: content,
      message: `Content for ${key} updated successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpsertContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items } = req.body as { items: Record<string, unknown> };

    if (!items || typeof items !== "object") {
      return sendResponse({
        res,
        status: 400,
        success: false,
        message: "Items object is required",
      });
    }

    const results = await prisma.$transaction(
      Object.entries(items).map(([key, data]) =>
        prisma.siteContent.upsert({
          where: { key },
          update: { data: data as Prisma.InputJsonValue },
          create: { key, data: data as Prisma.InputJsonValue },
        })
      )
    );

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: results,
      message: "Content updated successfully in bulk",
    });
  } catch (error) {
    next(error);
  }
};
