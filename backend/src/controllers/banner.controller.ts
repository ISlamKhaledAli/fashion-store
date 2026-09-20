import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { NotFoundError, ValidationError } from "../utils/AppError";
import { logAudit } from "../utils/auditLogger";

export const getPublicBanners = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { position: "asc" },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminBanners = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { position: "asc" },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      subtitle,
      imageUrl,
      linkUrl,
      badge,
      position = 0,
      isActive = true,
      startDate,
      endDate,
    } = req.body;

    if (!title || !imageUrl) {
      throw new ValidationError("Title and Image URL are required");
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        imageUrl,
        linkUrl: linkUrl || null,
        badge: badge || null,
        position: Number(position) || 0,
        isActive: Boolean(isActive),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    logAudit(req, {
      action: "BANNER_CREATE",
      entity: "Banner",
      entityId: banner.id,
      details: { title, position },
    });

    return sendResponse({
      res,
      status: 201,
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      imageUrl,
      linkUrl,
      badge,
      position,
      isActive,
      startDate,
      endDate,
    } = req.body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (subtitle !== undefined) data.subtitle = subtitle || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (linkUrl !== undefined) data.linkUrl = linkUrl || null;
    if (badge !== undefined) data.badge = badge || null;
    if (position !== undefined) data.position = Number(position);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (startDate !== undefined)
      data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      data.endDate = endDate ? new Date(endDate) : null;

    const banner = await prisma.banner.update({
      where: { id: String(id) },
      data: data as any,
    });

    logAudit(req, {
      action: "BANNER_UPDATE",
      entity: "Banner",
      entityId: banner.id,
      details: { title: banner.title },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.banner.delete({
      where: { id: String(id) },
    });

    logAudit(req, {
      action: "BANNER_DELETE",
      entity: "Banner",
      entityId: String(id),
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Banner purged",
    });
  } catch (error) {
    next(error);
  }
};
