import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { getPagination, calculatePagination } from "../utils/pagination";
import { createDiscountSchema } from "../validators/common.validator";
import { NotFoundError } from "../utils/AppError";

export const getAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search, page, limit } = req.query;
    const { skip, limit: take, page: currentPage } = getPagination({
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
                include: { images: true }
              },
              variant: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    const pagination = calculatePagination(total, currentPage, take);

    return sendResponse({ res, status: 200, success: true, data: orders, pagination });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: String(id) },
      data: { 
        status,
        shippedAt: status === "SHIPPED" ? new Date() : undefined
      },
    });

    return sendResponse({ res, status: 200, success: true, data: order });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2025") {
      throw new NotFoundError("Order not found");
    }
    next(error);
  }
};

export const bulkUpdateOrdersStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse({ res, status: 400, success: false, message: "Order IDs are required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      return await tx.order.updateMany({
        where: { id: { in: ids } },
        data: { 
          status,
          shippedAt: status === "SHIPPED" ? new Date() : undefined
        },
      });
    });

    return sendResponse({ res, status: 200, success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse({ res, status: 400, success: false, message: "Order IDs are required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      return await tx.order.deleteMany({
        where: { id: { in: ids } },
      });
    });

    return sendResponse({ res, status: 200, success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        _count: { select: { orders: true } },
        orders: { select: { total: true } },
      },
    });

    const customersWithStats = customers.map(user => {
      const totalSpent = user.orders.reduce((acc, order) => acc + order.total, 0);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        orderCount: user._count.orders,
        totalSpent,
      };
    });

    return sendResponse({ res, status: 200, success: true, data: customersWithStats });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfToday } },
      _sum: { total: true },
    });

    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });

    // Conversion rate: (paid orders / total customers) - naive but works for overview
    const paidOrders = await prisma.order.count({ where: { paymentStatus: "PAID" } });
    const conversionRate = totalCustomers > 0 ? (paidOrders / totalCustomers) * 100 : 0;

    const today = new Date();
    today.setHours(0,0,0,0);

    const [ordersToday, newCustomers, rawStatusCounts] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: today }, role: 'CUSTOMER' } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
    ]);

    const statusCounts = rawStatusCounts.reduce((acc: any, s) => ({ ...acc, [s.status]: s._count }), {});

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.total || 0,
        todayRevenue: todayRevenue._sum.total || 0,
        totalOrders,
        totalCustomers,
        conversionRate,
        ordersToday,
        newCustomers,
        statusCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueAnalytics = async (req: Request, res: Response, next: NextFunction) => {
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
    revenue.forEach(item => {
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

export const getTopProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const products = await prisma.product.findMany({
      where: { id: { in: topProducts.map(p => p.productId) } },
      select: { id: true, name: true, price: true },
    });

    const result = topProducts.map(tp => {
      const product = products.find(p => p.id === tp.productId);
      return {
        id: tp.productId,
        name: product?.name,
        quantity: tp._sum.quantity,
        revenue: (tp._sum.quantity || 0) * (product?.price || 0),
      };
    });

    return sendResponse({ res, status: 200, success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lowStockVariants = await prisma.variant.findMany({
      where: { stock: { lt: 5 } },
      include: { product: { select: { name: true } } },
    });

    return sendResponse({ res, status: 200, success: true, data: lowStockVariants });
  } catch (error) {
    next(error);
  }
};

export const createDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createDiscountSchema.parse(req.body);
    const discount = await prisma.discount.create({ data: validatedData });
    return sendResponse({ res, status: 201, success: true, data: discount });
  } catch (error) {
    next(error);
  }
};

export const getDiscounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discounts = await prisma.discount.findMany();
    return sendResponse({ res, status: 200, success: true, data: discounts });
  } catch (error) {
    next(error);
  }
};
