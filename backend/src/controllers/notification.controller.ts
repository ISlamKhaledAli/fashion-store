import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../utils/AppError";

// Get notifications for current user or admin
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new ForbiddenError("Authentication required");
    }

    const { unreadOnly, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 20)
    );
    const skip = (pageNum - 1) * limitNum;

    // Admin sees admin notifications (userId is null) plus their own
    const where: any =
      user.role === "ADMIN"
        ? { OR: [{ userId: null }, { userId: user.id }] }
        : { userId: user.id };

    if (unreadOnly === "true") {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where }),
    ]);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: notifications,
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

// Get count of unread notifications
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new ForbiddenError("Authentication required");
    }

    const where: any =
      user.role === "ADMIN"
        ? { OR: [{ userId: null }, { userId: user.id }], isRead: false }
        : { userId: user.id, isRead: false };

    const count = await prisma.notification.count({ where });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};

// Mark single notification as read
export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const user = req.user;
    if (!user) {
      throw new ForbiddenError("Authentication required");
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (
      notification.userId &&
      notification.userId !== user.id &&
      user.role !== "ADMIN"
    ) {
      throw new ForbiddenError("Unauthorized access");
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new ForbiddenError("Authentication required");
    }

    const where: any =
      user.role === "ADMIN"
        ? { OR: [{ userId: null }, { userId: user.id }], isRead: false }
        : { userId: user.id, isRead: false };

    await prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// Broadcast notification to all users or admins (Admin only)
export const broadcastNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      message,
      type = "SYSTEM",
      data = {},
      target = "ALL",
    } = req.body;

    if (!title || !message) {
      throw new ValidationError("Title and message are required for broadcast");
    }

    if (target === "ADMINS") {
      const notification = await prisma.notification.create({
        data: {
          userId: null,
          title,
          message,
          type,
          data,
        },
      });
      return sendResponse({
        res,
        status: 201,
        success: true,
        message: "Admin broadcast notification created",
        data: notification,
      });
    }

    const activeUsers = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });

    if (activeUsers.length > 0) {
      await prisma.notification.createMany({
        data: activeUsers.map((u) => ({
          userId: u.id,
          title,
          message,
          type,
          data,
        })),
      });
    }

    return sendResponse({
      res,
      status: 201,
      success: true,
      message: `Broadcast sent to ${activeUsers.length} active members`,
      data: { count: activeUsers.length },
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const notification = await prisma.notification.findUnique({
      where: { id: String(id) },
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (user?.role !== "ADMIN" && notification.userId !== user?.id) {
      throw new ForbiddenError("Not authorized to delete this notification");
    }

    await prisma.notification.delete({
      where: { id: String(id) },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    next(error);
  }
};
