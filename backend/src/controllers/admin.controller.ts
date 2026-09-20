import { Request, Response, NextFunction } from "express";
import { Prisma, RentalStatus, PaymentStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { getPagination, calculatePagination } from "../utils/pagination";
import { createDiscountSchema } from "../validators/common.validator";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../utils/AppError";
import { isNotFoundError } from "../utils/prismaErrors";
import {
  sendShippingNotificationEmail,
  sendOrderProcessingEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from "../services/email";
import stripe from "../services/stripe";
import logger from "../utils/logger";
import { logAudit } from "../utils/auditLogger";

export const getAdminCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });
    return sendResponse({ res, status: 200, success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return sendResponse({
        res,
        status: 400,
        success: false,
        message: "Invalid payload format",
      });
    }

    // Use a transaction to perform bulk updates efficiently
    await prisma.$transaction(
      items.map(
        (item: { id: string; position: number; parentId: string | null }) =>
          prisma.category.update({
            where: { id: item.id },
            data: {
              position: item.position,
              ...(item.parentId === null
                ? { parent: { disconnect: true } }
                : item.parentId
                  ? { parent: { connect: { id: item.parentId } } }
                  : {}),
            },
          })
      )
    );

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Categories reordered successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, search, page, limit } = req.query;
    const {
      skip,
      limit: take,
      page: currentPage,
    } = getPagination({
      page: Number(page),
      limit: Number(limit),
    });

    const where: any = {};
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { id: { contains: String(search), mode: "insensitive" } },
        { user: { name: { contains: String(search), mode: "insensitive" } } },
        { user: { email: { contains: String(search), mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take,
        skip,
        include: {
          user: { select: { name: true, email: true, avatar: true } },
          address: true,
          items: {
            include: {
              product: {
                include: { images: true },
              },
              variant: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    const pagination = calculatePagination(total, currentPage, take);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: orders,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier } = req.body;

    const dataToUpdate: Prisma.OrderUpdateInput = {};
    if (status) {
      dataToUpdate.status = status;
      if (status === "SHIPPED") {
        dataToUpdate.shippedAt = new Date();
      }
    }
    if (trackingNumber !== undefined) {
      dataToUpdate.trackingNumber = trackingNumber;
    }
    if (carrier !== undefined) {
      dataToUpdate.carrier = carrier;
    }

    const order = await prisma.order.update({
      where: { id: String(id) },
      data: dataToUpdate,
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    if (status === "SHIPPED" && order.user?.email && order.trackingNumber) {
      sendShippingNotificationEmail({
        to: order.user.email,
        orderNumber: order.id,
        customerName: order.user.name,
        carrier: order.carrier || undefined,
        trackingNumber: order.trackingNumber,
      }).catch((err) => {
        logger.warn(
          `Failed to send shipping email for order ${order.id}:`,
          err
        );
      });
    } else if (status === "PROCESSING" && order.user?.email) {
      sendOrderProcessingEmail({
        to: order.user.email,
        orderNumber: order.id,
        customerName: order.user.name,
      }).catch((err) => {
        logger.warn(
          `Failed to send processing email for order ${order.id}:`,
          err
        );
      });
    } else if (status === "DELIVERED" && order.user?.email) {
      sendOrderDeliveredEmail({
        to: order.user.email,
        orderNumber: order.id,
        customerName: order.user.name,
      }).catch((err) => {
        logger.warn(
          `Failed to send delivery email for order ${order.id}:`,
          err
        );
      });
    } else if (status === "CANCELLED" && order.user?.email) {
      sendOrderCancelledEmail({
        to: order.user.email,
        orderNumber: order.id,
        customerName: order.user.name,
      }).catch((err) => {
        logger.warn(
          `Failed to send cancellation email for order ${order.id}:`,
          err
        );
      });
    }

    logAudit(req, {
      action: "ORDER_STATUS_UPDATE",
      entity: "Order",
      entityId: order.id,
      details: {
        status: order.status,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
      },
    });

    return sendResponse({ res, status: 200, success: true, data: order });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Order not found"));
    }
    next(error);
  }
};

export const bulkUpdateOrdersStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse({
        res,
        status: 400,
        success: false,
        message: "Order IDs are required",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      return await tx.order.updateMany({
        where: { id: { in: ids } },
        data: {
          status,
          shippedAt: status === "SHIPPED" ? new Date() : undefined,
        },
      });
    });

    logAudit(req, {
      action: "ORDER_STATUS_BULK_UPDATE",
      entity: "Order",
      details: { count: result.count, status, ids },
    });

    return sendResponse({ res, status: 200, success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse({
        res,
        status: 400,
        success: false,
        message: "Order IDs are required",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      return await tx.order.deleteMany({
        where: { id: { in: ids } },
      });
    });

    logAudit(req, {
      action: "ORDER_BULK_DELETE",
      entity: "Order",
      details: { count: result.count, ids },
    });

    return sendResponse({ res, status: 200, success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, status } = req.query;

    const where: any = { role: "CUSTOMER" };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { id: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const customersWithStats = customers.map((user) => {
      const totalSpent = user.orders.reduce(
        (acc, order) => acc + order.total,
        0
      );
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        tags: user.tags || [],
        adminNotes: user.adminNotes || null,
        joinDate: user.createdAt,
        totalOrders: user._count.orders,
        totalSpent,
        orders: user.orders.map((o) => ({
          id: o.id,
          total: o.total,
          status: o.status,
          date: o.createdAt,
        })),
      };
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: customersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id: String(id) },
      data: { status },
    });

    logAudit(req, {
      action: "CUSTOMER_STATUS_UPDATE",
      entity: "User",
      entityId: user.id,
      details: { status: user.status, email: user.email },
    });

    return sendResponse({ res, status: 200, success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Optional: Check if user has orders before deleting, or use cascade
    await prisma.user.delete({
      where: { id: String(id) },
    });

    logAudit(req, {
      action: "CUSTOMER_DELETE",
      entity: "User",
      entityId: String(id),
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Customer profile purged",
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period (0-30 days)
    const [totalRevenue, totalOrders, totalCustomers, paidOrdersCount] =
      await Promise.all([
        prisma.order.aggregate({
          where: { paymentStatus: "PAID" },
          _sum: { total: true },
        }),
        prisma.order.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.order.count({ where: { paymentStatus: "PAID" } }),
      ]);

    // Trend calculation data
    const [prevRevenue, prevOrders, prevCustomers, prevPaidOrders] =
      await Promise.all([
        prisma.order.aggregate({
          where: {
            paymentStatus: "PAID",
            createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          },
          _sum: { total: true },
        }),
        prisma.order.count({
          where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        }),
        prisma.user.count({
          where: {
            role: "CUSTOMER",
            createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          },
        }),
        prisma.order.count({
          where: {
            paymentStatus: "PAID",
            createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          },
        }),
      ]);

    const curRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
    });
    const curOrders = await prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const curCustomers = await prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: thirtyDaysAgo } },
    });
    const curPaidOrders = await prisma.order.count({
      where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
    });

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    };

    const revenueTrend = calculateTrend(
      curRevenue._sum.total || 0,
      prevRevenue._sum.total || 0
    );
    const ordersTrend = calculateTrend(curOrders, prevOrders);
    const customersTrend = calculateTrend(curCustomers, prevCustomers);

    const curConv = curCustomers > 0 ? (curPaidOrders / curCustomers) * 100 : 0;
    const prevConv =
      prevCustomers > 0 ? (prevPaidOrders / prevCustomers) * 100 : 0;
    const conversionTrend = calculateTrend(curConv, prevConv);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfToday } },
      _sum: { total: true },
    });

    const [ordersToday, newCustomers, rawStatusCounts, dailyRevenueRaw] =
      await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.user.count({
          where: { createdAt: { gte: startOfToday }, role: "CUSTOMER" },
        }),
        prisma.order.groupBy({ by: ["status"], _count: true }),
        prisma.order.groupBy({
          by: ["createdAt"],
          where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
          _sum: { total: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    // Format daily revenue for sparklines
    const dailyRevenueMap: Record<string, number> = {};
    dailyRevenueRaw.forEach((day) => {
      const date = day.createdAt.toISOString().split("T")[0];
      dailyRevenueMap[date] =
        (dailyRevenueMap[date] || 0) + (day._sum.total || 0);
    });
    const dailyRevenue = Object.entries(dailyRevenueMap).map(
      ([date, amount]) => ({ date, amount })
    );

    const statusCounts = rawStatusCounts.reduce(
      (acc: any, s) => ({ ...acc, [s.status]: s._count }),
      {}
    );

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.total || 0,
        revenueTrend,
        todayRevenue: todayRevenue._sum.total || 0,
        totalOrders,
        ordersTrend,
        totalCustomers,
        customersTrend,
        conversionRate:
          totalCustomers > 0 ? (paidOrdersCount / totalCustomers) * 100 : 0,
        conversionTrend,
        ordersToday,
        newCustomers,
        statusCounts,
        dailyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { days = 30 } = req.query;
    const daysRequested = Number(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysRequested);

    const revenue = await prisma.order.groupBy({
      by: ["createdAt"],
      where: { paymentStatus: "PAID", createdAt: { gte: startDate } },
      _sum: { total: true },
    });

    const revenueByDay: { [key: string]: number } = {};
    revenue.forEach((item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + (item._sum.total || 0);
    });

    // Convert to sorted array for easier chart consumption
    const result = Object.entries(revenueByDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return sendResponse({ res, status: 200, success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const products = await prisma.product.findMany({
      where: { id: { in: topProducts.map((p) => p.productId) } },
      select: {
        id: true,
        name: true,
        price: true,
        images: { where: { isMain: true }, take: 1 },
        category: { select: { name: true } },
      },
    });

    const result = topProducts.map((tp) => {
      const product = products.find((p) => p.id === tp.productId);
      return {
        id: tp.productId,
        name: product?.name,
        image: product?.images?.[0]?.url || null,
        categoryName: product?.category?.name || null,
        quantity: tp._sum.quantity,
        revenue: (tp._sum.quantity || 0) * (product?.price || 0),
      };
    });

    return sendResponse({ res, status: 200, success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getCategoryRevenue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });

    const categoryMap: Record<
      string,
      { id: string; name: string; orders: number; revenue: number }
    > = {};

    for (const item of orderItems) {
      const catName = item.product?.category?.name || "Uncategorized";
      const catId = item.product?.category?.id || "uncategorized";
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          id: catId,
          name: catName,
          orders: 0,
          revenue: 0,
        };
      }
      categoryMap[catName].orders += item.quantity;
      categoryMap[catName].revenue += item.price * item.quantity;
    }

    const data = Object.values(categoryMap).sort(
      (a, b) => b.revenue - a.revenue
    );

    return sendResponse({ res, status: 200, success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCustomerRetention = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get all customers with their order count
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    const newCustomers = customers.filter((c) => c._count.orders <= 1).length;
    const returningCustomers = customers.filter(
      (c) => c._count.orders > 1
    ).length;
    const total = customers.length;

    const data = {
      newCustomers,
      returningCustomers,
      total,
      newPercentage: total > 0 ? Math.round((newCustomers / total) * 100) : 0,
      returningPercentage:
        total > 0 ? Math.round((returningCustomers / total) * 100) : 0,
    };

    return sendResponse({ res, status: 200, success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        images: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sendResponse({ res, status: 200, success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryStock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { variantId } = req.params;
    const { stock } = req.body;

    if (stock === undefined || isNaN(parseInt(stock))) {
      return sendResponse({
        res,
        status: 400,
        success: false,
        message: "Valid stock quantity is required",
      });
    }

    const variant = await prisma.variant.update({
      where: { id: String(variantId) },
      data: { stock: parseInt(stock) },
    });

    logAudit(req, {
      action: "INVENTORY_STOCK_UPDATE",
      entity: "Variant",
      entityId: variant.id,
      details: { newStock: variant.stock, sku: variant.sku },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: variant,
      message: "Stock updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const createDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createDiscountSchema.parse(req.body);
    const discount = await prisma.discount.create({ data: validatedData });

    logAudit(req, {
      action: "DISCOUNT_CREATE",
      entity: "Discount",
      entityId: discount.id,
      details: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
      },
    });

    return sendResponse({ res, status: 201, success: true, data: discount });
  } catch (error) {
    next(error);
  }
};

export const getDiscounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Fetch revenue per code for PAID orders
    const revenueData = await prisma.order.groupBy({
      by: ["promoCode"],
      where: { paymentStatus: "PAID", promoCode: { not: null } },
      _sum: { total: true },
    });

    const revenueMap: Record<string, number> = {};
    revenueData.forEach((item) => {
      if (item.promoCode) revenueMap[item.promoCode] = item._sum.total || 0;
    });

    const discountsWithRevenue = discounts.map((d) => ({
      ...d,
      revenueGenerated: revenueMap[d.code] || 0,
    }));

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: discountsWithRevenue,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = createDiscountSchema.partial().parse(req.body);

    const discount = await prisma.discount.update({
      where: { id: String(id) },
      data: validatedData,
    });

    logAudit(req, {
      action: "DISCOUNT_UPDATE",
      entity: "Discount",
      entityId: discount.id,
      details: { code: discount.code },
    });

    return sendResponse({ res, status: 200, success: true, data: discount });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Discount not found"));
    }
    next(error);
  }
};

export const deleteDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.discount.delete({ where: { id: String(id) } });

    logAudit(req, {
      action: "DISCOUNT_DELETE",
      entity: "Discount",
      entityId: String(id),
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Discount purged",
    });
  } catch (error) {
    next(error);
  }
};
export const getGeographicData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: {
        total: true,
        address: {
          select: { country: true },
        },
      },
    });

    const countryMap: Record<string, { orders: number; revenue: number }> = {};

    for (const order of orders) {
      const country = order.address?.country || "Unknown";
      if (!countryMap[country]) countryMap[country] = { orders: 0, revenue: 0 };
      countryMap[country].orders += 1;
      countryMap[country].revenue += order.total;
    }

    const data = Object.entries(countryMap)
      .map(([country, stats]) => ({ country, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return sendResponse({ res, status: 200, success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN RENTAL MANAGEMENT ───

export const getAdminRentals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, search, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 20)
    );
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (
      status &&
      Object.values(RentalStatus).includes(status as RentalStatus)
    ) {
      where.status = status as RentalStatus;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { product: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [rentals, total] = await Promise.all([
      prisma.rental.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          product: { include: { images: true } },
          variant: true,
          rentalPeriod: true,
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.rental.count({ where }),
    ]);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: rentals,
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

export const updateAdminRentalStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const { status, notes, lateFee } = req.body;

    if (!status || !Object.values(RentalStatus).includes(status)) {
      throw new ValidationError("Valid rental status is required");
    }

    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { variant: true, user: true, product: true },
    });

    if (!rental) {
      throw new NotFoundError("Rental reservation not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If moving to RETURNED or CANCELLED from RESERVED/ACTIVE, restore inventory stock
      if (
        (status === RentalStatus.RETURNED ||
          status === RentalStatus.CANCELLED) &&
        rental.status !== RentalStatus.RETURNED &&
        rental.status !== RentalStatus.CANCELLED
      ) {
        await tx.variant.update({
          where: { id: rental.variantId },
          data: { stock: { increment: 1 } },
        });
      }

      return await tx.rental.update({
        where: { id },
        data: {
          status: status as RentalStatus,
          notes: notes ?? rental.notes,
          lateFee: lateFee !== undefined ? Number(lateFee) : rental.lateFee,
          actualReturnDate:
            status === RentalStatus.RETURNED
              ? new Date()
              : rental.actualReturnDate,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: true,
          variant: true,
        },
      });
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: rental.userId,
        type: "RENTAL_STATUS_UPDATE",
        title: `Rental Update: ${status}`,
        message: `Your rental for "${rental.product.name}" is now marked as ${status}.`,
        data: { rentalId: rental.id, status },
      },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: `Rental status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const refundRentalDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);

    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { user: true, product: true },
    });

    if (!rental) {
      throw new NotFoundError("Rental reservation not found");
    }

    if (rental.depositReturned) {
      throw new ValidationError("Security deposit has already been refunded");
    }

    if (rental.securityDeposit <= 0) {
      throw new ValidationError("No security deposit was held for this rental");
    }

    if (rental.stripePaymentId) {
      try {
        await stripe.refunds.create({
          payment_intent: rental.stripePaymentId,
          amount: Math.round(rental.securityDeposit * 100),
        });
      } catch (err) {
        logger.warn("Stripe deposit refund warning:", err);
      }
    }

    const updated = await prisma.rental.update({
      where: { id },
      data: { depositReturned: true },
    });

    await prisma.notification.create({
      data: {
        userId: rental.userId,
        type: "DEPOSIT_RETURNED",
        title: "Security Deposit Refunded",
        message: `Your deposit of $${rental.securityDeposit.toFixed(2)} for "${rental.product.name}" has been refunded.`,
        data: { rentalId: rental.id, amount: rental.securityDeposit },
      },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Security deposit refunded successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const addRentalLateFee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const { fee } = req.body;

    if (fee === undefined || Number(fee) < 0) {
      throw new ValidationError("Valid late fee amount is required");
    }

    const updated = await prisma.rental.update({
      where: { id },
      data: { lateFee: Number(fee) },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Late fee updated",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getRentalAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalRentals,
      activeRentals,
      overdueRentals,
      returnedRentals,
      rentals,
    ] = await Promise.all([
      prisma.rental.count(),
      prisma.rental.count({ where: { status: RentalStatus.ACTIVE } }),
      prisma.rental.count({ where: { status: RentalStatus.OVERDUE } }),
      prisma.rental.count({ where: { status: RentalStatus.RETURNED } }),
      prisma.rental.findMany({
        select: {
          rentalPrice: true,
          securityDeposit: true,
          depositReturned: true,
          lateFee: true,
        },
      }),
    ]);

    const totalRentalRevenue = rentals.reduce(
      (sum, r) => sum + r.rentalPrice + r.lateFee,
      0
    );
    const depositsHeld = rentals
      .filter((r) => !r.depositReturned)
      .reduce((sum, r) => sum + r.securityDeposit, 0);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        totalRentals,
        activeRentals,
        overdueRentals,
        returnedRentals,
        totalRentalRevenue: Math.round(totalRentalRevenue * 100) / 100,
        depositsHeld: Math.round(depositsHeld * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN STORE SETTINGS ───

const DEFAULT_SETTINGS: Record<string, any> = {
  lowStockThreshold: 5,
  abandonedCartEmailDelay: 60,
  abandonedCartDiscountPercent: 5,
  enableSecurityDeposit: true,
  defaultLateFeePerDay: 15,
  maxRentalExtensionDays: 7,
  enableAbandonedCartRecovery: true,
  storeSalons: [
    { name: "Cairo Flagship Salon", address: "15 Brazil St, Zamalek, Cairo" },
    { name: "Alexandria Boutique", address: "Glim Bay, Alexandria" },
  ],
};

export const getStoreSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stored = await prisma.storeSettings.findMany();
    const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const s of stored) {
      settingsMap[s.key] = s.value;
    }

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: settingsMap,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStoreSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = String(req.params.key);
    const { value } = req.body;

    if (value === undefined) {
      throw new ValidationError("Value is required");
    }

    const updated = await prisma.storeSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    logAudit(req, {
      action: "STORE_SETTING_UPDATE",
      entity: "StoreSettings",
      entityId: key,
      details: { key, value },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: `Setting ${key} updated successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ─── SHIPPING ZONES MANAGEMENT ───

export const getShippingZones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: { createdAt: "asc" },
    });
    return sendResponse({ res, status: 200, success: true, data: zones });
  } catch (error) {
    next(error);
  }
};

export const createShippingZone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      countries,
      cities,
      standardRate,
      expressRate,
      freeAbove,
      isActive,
    } = req.body;

    if (!name || standardRate === undefined) {
      throw new ValidationError("Name and standard rate are required");
    }

    const zone = await prisma.shippingZone.create({
      data: {
        name,
        countries: countries || ["EG"],
        cities: cities || null,
        standardRate: Number(standardRate),
        expressRate: expressRate !== undefined ? Number(expressRate) : null,
        freeAbove: freeAbove !== undefined ? Number(freeAbove) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return sendResponse({
      res,
      status: 201,
      success: true,
      message: "Shipping zone created successfully",
      data: zone,
    });
  } catch (error) {
    next(error);
  }
};

export const updateShippingZone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const {
      name,
      countries,
      cities,
      standardRate,
      expressRate,
      freeAbove,
      isActive,
    } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (countries !== undefined) data.countries = countries;
    if (cities !== undefined) data.cities = cities;
    if (standardRate !== undefined) data.standardRate = Number(standardRate);
    if (expressRate !== undefined) data.expressRate = Number(expressRate);
    if (freeAbove !== undefined) data.freeAbove = Number(freeAbove);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.shippingZone.update({
      where: { id },
      data,
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Shipping zone updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShippingZone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    await prisma.shippingZone.delete({ where: { id } });

    logAudit(req, {
      action: "SHIPPING_ZONE_DELETE",
      entity: "ShippingZone",
      entityId: id,
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Shipping zone deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { action, entity, search, page, limit } = req.query;
    const {
      skip,
      limit: take,
      page: currentPage,
    } = getPagination({
      page: Number(page),
      limit: Number(limit) || 20,
    });

    const where: Prisma.AuditLogWhereInput = {};
    if (action && typeof action === "string") {
      where.action = action;
    }
    if (entity && typeof entity === "string") {
      where.entity = entity;
    }
    if (search && typeof search === "string") {
      where.OR = [
        { userName: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
        { entityId: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const pagination = calculatePagination(total, currentPage, take);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: logs,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderInternalNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { internalNotes } = req.body;

    const order = await prisma.order.update({
      where: { id: String(id) },
      data: { internalNotes: internalNotes ?? null },
    });

    logAudit(req, {
      action: "ORDER_NOTES_UPDATE",
      entity: "Order",
      entityId: order.id,
      details: { internalNotes },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Internal notes saved",
      data: order,
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Order not found"));
    }
    next(error);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason, restock = true } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: String(id) },
      include: {
        items: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!existingOrder) {
      throw new NotFoundError("Order not found");
    }

    if (existingOrder.status === "CANCELLED") {
      throw new ValidationError("Order is already cancelled");
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restock inventory if requested
      if (restock && existingOrder.items.length > 0) {
        for (const item of existingOrder.items) {
          if (item.variantId) {
            await tx.variant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      return await tx.order.update({
        where: { id: String(id) },
        data: {
          status: "CANCELLED",
          internalNotes: reason
            ? `${existingOrder.internalNotes ? existingOrder.internalNotes + "\n" : ""}Cancellation Reason: ${reason}`
            : existingOrder.internalNotes,
        },
        include: {
          user: { select: { email: true, name: true } },
        },
      });
    });

    if (updatedOrder.user?.email) {
      sendOrderCancelledEmail({
        to: updatedOrder.user.email,
        orderNumber: updatedOrder.id,
        customerName: updatedOrder.user.name,
        reason,
      }).catch((err) => {
        logger.warn(`Failed to send cancellation email for order ${id}:`, err);
      });
    }

    logAudit(req, {
      action: "ORDER_CANCEL",
      entity: "Order",
      entityId: updatedOrder.id,
      details: { reason, restock },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Order cancelled successfully",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomer360 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findUnique({
      where: { id: String(id) },
      include: {
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                product: { select: { name: true, images: true } },
                variant: { select: { size: true, color: true, sku: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          include: { product: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        rentals: {
          orderBy: { createdAt: "desc" },
        },
        measurements: true,
      },
    });

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    const totalSpent = customer.orders.reduce((acc, o) => acc + o.total, 0);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        ...customer,
        totalSpent,
        totalOrders: customer.orders.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { tags, adminNotes, status, role } = req.body;

    const data: Prisma.UserUpdateInput = {};
    if (tags !== undefined && Array.isArray(tags)) {
      data.tags = tags;
    }
    if (adminNotes !== undefined) {
      data.adminNotes = adminNotes;
    }
    if (status !== undefined) {
      data.status = status;
    }
    if (role !== undefined) {
      if (role !== Role.CUSTOMER && role !== Role.ADMIN) {
        throw new ValidationError("Invalid role specified");
      }
      if (req.user?.id === id && role !== Role.ADMIN) {
        throw new ForbiddenError(
          "You cannot revoke your own administrator privileges"
        );
      }
      data.role = role;
    }

    const user = await prisma.user.update({
      where: { id: String(id) },
      data,
    });

    logAudit(req, {
      action: "CUSTOMER_DETAILS_UPDATE",
      entity: "User",
      entityId: user.id,
      details: { tags, adminNotes, status, role },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Customer profile updated",
      data: user,
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return next(new NotFoundError("Customer not found"));
    }
    next(error);
  }
};
