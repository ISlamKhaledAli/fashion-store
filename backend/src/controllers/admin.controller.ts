import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { getPagination, calculatePagination } from "../utils/pagination";
import { createDiscountSchema } from "../validators/common.validator";
import { NotFoundError } from "../utils/AppError";

export const getAdminCategories = async (req: Request, res: Response, next: NextFunction) => {
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

export const reorderCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return sendResponse({ res, status: 400, success: false, message: "Invalid payload format" });
    }

    // Use a transaction to perform bulk updates efficiently
    await prisma.$transaction(
      items.map((item: { id: string; position: number; parentId: string | null }) =>
        prisma.category.update({
          where: { id: item.id },
          data: {
            position: item.position,
            ...(item.parentId === null
              ? { parent: { disconnect: true } }
              : item.parentId
              ? { parent: { connect: { id: item.parentId } } }
              : {})
          },
        })
      )
    );

    return sendResponse({ res, status: 200, success: true, message: "Categories reordered successfully" });
  } catch (error) {
    next(error);
  }
};

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
          take: 5
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const customersWithStats = customers.map(user => {
      const totalSpent = user.orders.reduce((acc, order) => acc + order.total, 0);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        joinDate: user.createdAt,
        totalOrders: user._count.orders,
        totalSpent,
        orders: user.orders.map(o => ({
          id: o.id,
          total: o.total,
          status: o.status,
          date: o.createdAt
        }))
      };
    });

    return sendResponse({ res, status: 200, success: true, data: customersWithStats });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id: String(id) },
      data: { status },
    });

    return sendResponse({ res, status: 200, success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Optional: Check if user has orders before deleting, or use cascade
    await prisma.user.delete({
      where: { id: String(id) },
    });

    return sendResponse({ res, status: 200, success: true, message: "Customer profile purged" });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period (0-30 days)
    const [totalRevenue, totalOrders, totalCustomers, paidOrdersCount] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count({ where: { paymentStatus: "PAID" } }),
    ]);

    // Trend calculation data
    const [prevRevenue, prevOrders, prevCustomers, prevPaidOrders] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.order.count({ where: { paymentStatus: "PAID", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    ]);

    const curRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
    });
    const curOrders = await prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
    const curCustomers = await prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: thirtyDaysAgo } } });
    const curPaidOrders = await prisma.order.count({ where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } } });

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat(((current - previous) / previous * 100).toFixed(1));
    };

    const revenueTrend = calculateTrend(curRevenue._sum.total || 0, prevRevenue._sum.total || 0);
    const ordersTrend = calculateTrend(curOrders, prevOrders);
    const customersTrend = calculateTrend(curCustomers, prevCustomers);
    
    const curConv = curCustomers > 0 ? (curPaidOrders / curCustomers) * 100 : 0;
    const prevConv = prevCustomers > 0 ? (prevPaidOrders / prevCustomers) * 100 : 0;
    const conversionTrend = calculateTrend(curConv, prevConv);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfToday } },
      _sum: { total: true },
    });

    const [ordersToday, newCustomers, rawStatusCounts, dailyRevenueRaw] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfToday }, role: 'CUSTOMER' } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
      prisma.order.groupBy({
        by: ['createdAt'],
        where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Format daily revenue for sparklines
    const dailyRevenueMap: Record<string, number> = {};
    dailyRevenueRaw.forEach(day => {
        const date = day.createdAt.toISOString().split('T')[0];
        dailyRevenueMap[date] = (dailyRevenueMap[date] || 0) + (day._sum.total || 0);
    });
    const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, amount]) => ({ date, amount }));

    const statusCounts = rawStatusCounts.reduce((acc: any, s) => ({ ...acc, [s.status]: s._count }), {});

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
        conversionRate: totalCustomers > 0 ? (paidOrdersCount / totalCustomers) * 100 : 0,
        conversionTrend,
        ordersToday,
        newCustomers,
        statusCounts,
        dailyRevenue
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
      select: {
        id: true,
        name: true,
        price: true,
        images: { where: { isMain: true }, take: 1 },
        category: { select: { name: true } },
      },
    });

    const result = topProducts.map(tp => {
      const product = products.find(p => p.id === tp.productId);
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

export const getCategoryRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });

    const categoryMap: Record<string, { id: string; name: string; orders: number; revenue: number }> = {};

    for (const item of orderItems) {
      const catName = item.product?.category?.name || "Uncategorized";
      const catId = item.product?.category?.id || "uncategorized";
      if (!categoryMap[catName]) {
        categoryMap[catName] = { id: catId, name: catName, orders: 0, revenue: 0 };
      }
      categoryMap[catName].orders += item.quantity;
      categoryMap[catName].revenue += item.price * item.quantity;
    }

    const data = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

    return sendResponse({ res, status: 200, success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCustomerRetention = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all customers with their order count
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        createdAt: true,
        _count: { select: { orders: true } }
      }
    });

    const newCustomers = customers.filter(c => c._count.orders <= 1).length;
    const returningCustomers = customers.filter(c => c._count.orders > 1).length;
    const total = customers.length;

    const data = {
      newCustomers,
      returningCustomers,
      total,
      newPercentage: total > 0 ? Math.round((newCustomers / total) * 100) : 0,
      returningPercentage: total > 0 ? Math.round((returningCustomers / total) * 100) : 0,
    };

    return sendResponse({ res, status: 200, success: true, data });
  } catch (error) {
    next(error);
  }
};


export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
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

export const updateInventoryStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variantId } = req.params;
    const { stock } = req.body;

    if (stock === undefined || isNaN(parseInt(stock))) {
      return sendResponse({ res, status: 400, success: false, message: "Valid stock quantity is required" });
    }

    const variant = await prisma.variant.update({
      where: { id: String(variantId) },
      data: { stock: parseInt(stock) },
    });

    return sendResponse({ res, status: 200, success: true, data: variant, message: "Stock updated successfully" });
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
    const discounts = await prisma.discount.findMany({
        orderBy: { createdAt: "desc" }
    });

    // Fetch revenue per code for PAID orders
    const revenueData = await prisma.order.groupBy({
      by: ["promoCode"],
      where: { paymentStatus: "PAID", promoCode: { not: null } },
      _sum: { total: true }
    });

    const revenueMap: Record<string, number> = {};
    revenueData.forEach(item => {
      if (item.promoCode) revenueMap[item.promoCode] = item._sum.total || 0;
    });

    const discountsWithRevenue = discounts.map(d => ({
      ...d,
      revenueGenerated: revenueMap[d.code] || 0
    }));

    return sendResponse({ res, status: 200, success: true, data: discountsWithRevenue });
  } catch (error) {
    next(error);
  }
};

export const updateDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = createDiscountSchema.partial().parse(req.body);
    
    const discount = await prisma.discount.update({
      where: { id: String(id) },
      data: validatedData
    });
    
    return sendResponse({ res, status: 200, success: true, data: discount });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2025") {
      throw new NotFoundError("Discount not found");
    }
    next(error);
  }
};

export const deleteDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.discount.delete({ where: { id: String(id) } });
    return sendResponse({ res, status: 200, success: true, message: "Discount purged" });
  } catch (error) {
    next(error);
  }
};
export const getGeographicData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: { 
        total: true, 
        address: { 
          select: { country: true } 
        } 
      }
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
