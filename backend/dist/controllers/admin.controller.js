"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscounts = exports.createDiscount = exports.getInventory = exports.getTopProducts = exports.getRevenueAnalytics = exports.getAnalyticsOverview = exports.getCustomers = exports.bulkDeleteOrders = exports.bulkUpdateOrdersStatus = exports.updateOrderStatus = exports.getAdminOrders = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const common_validator_1 = require("../validators/common.validator");
const AppError_1 = require("../utils/AppError");
const getAdminOrders = async (req, res, next) => {
    try {
        const { status, search, page, limit } = req.query;
        const { skip, limit: take, page: currentPage } = (0, pagination_1.getPagination)({
            page: Number(page),
            limit: Number(limit),
        });
        const where = {};
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { id: { contains: String(search), mode: "insensitive" } },
                { user: { name: { contains: String(search), mode: "insensitive" } } },
                { user: { email: { contains: String(search), mode: "insensitive" } } },
            ];
        }
        const [orders, total] = await Promise.all([
            prisma_1.prisma.order.findMany({
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
            prisma_1.prisma.order.count({ where }),
        ]);
        const pagination = (0, pagination_1.calculatePagination)(total, currentPage, take);
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: orders, pagination });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdminOrders = getAdminOrders;
const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await prisma_1.prisma.order.update({
            where: { id: String(id) },
            data: {
                status,
                shippedAt: status === "SHIPPED" ? new Date() : undefined
            },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: order });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Order not found");
        }
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const bulkUpdateOrdersStatus = async (req, res, next) => {
    try {
        const { ids, status } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return (0, apiResponse_1.sendResponse)({ res, status: 400, success: false, message: "Order IDs are required" });
        }
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            return await tx.order.updateMany({
                where: { id: { in: ids } },
                data: {
                    status,
                    shippedAt: status === "SHIPPED" ? new Date() : undefined
                },
            });
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkUpdateOrdersStatus = bulkUpdateOrdersStatus;
const bulkDeleteOrders = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return (0, apiResponse_1.sendResponse)({ res, status: 400, success: false, message: "Order IDs are required" });
        }
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            return await tx.order.deleteMany({
                where: { id: { in: ids } },
            });
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkDeleteOrders = bulkDeleteOrders;
const getCustomers = async (req, res, next) => {
    try {
        const customers = await prisma_1.prisma.user.findMany({
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
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: customersWithStats });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomers = getCustomers;
const getAnalyticsOverview = async (req, res, next) => {
    try {
        const totalRevenue = await prisma_1.prisma.order.aggregate({
            where: { paymentStatus: "PAID" },
            _sum: { total: true },
        });
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayRevenue = await prisma_1.prisma.order.aggregate({
            where: { paymentStatus: "PAID", createdAt: { gte: startOfToday } },
            _sum: { total: true },
        });
        const totalOrders = await prisma_1.prisma.order.count();
        const totalCustomers = await prisma_1.prisma.user.count({ where: { role: "CUSTOMER" } });
        // Conversion rate: (paid orders / total customers) - naive but works for overview
        const paidOrders = await prisma_1.prisma.order.count({ where: { paymentStatus: "PAID" } });
        const conversionRate = totalCustomers > 0 ? (paidOrders / totalCustomers) * 100 : 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [ordersToday, newCustomers, rawStatusCounts] = await Promise.all([
            prisma_1.prisma.order.count({ where: { createdAt: { gte: today } } }),
            prisma_1.prisma.user.count({ where: { createdAt: { gte: today }, role: 'CUSTOMER' } }),
            prisma_1.prisma.order.groupBy({ by: ['status'], _count: true }),
        ]);
        const statusCounts = rawStatusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {});
        return (0, apiResponse_1.sendResponse)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAnalyticsOverview = getAnalyticsOverview;
const getRevenueAnalytics = async (req, res, next) => {
    try {
        const { days = 30 } = req.query;
        const daysRequested = Number(days);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysRequested);
        const revenue = await prisma_1.prisma.order.groupBy({
            by: ["createdAt"],
            where: { paymentStatus: "PAID", createdAt: { gte: startDate } },
            _sum: { total: true },
        });
        const revenueByDay = {};
        revenue.forEach(item => {
            const date = item.createdAt.toISOString().split("T")[0];
            revenueByDay[date] = (revenueByDay[date] || 0) + (item._sum.total || 0);
        });
        // Convert to sorted array for easier chart consumption
        const result = Object.entries(revenueByDay)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getRevenueAnalytics = getRevenueAnalytics;
const getTopProducts = async (req, res, next) => {
    try {
        const topProducts = await prisma_1.prisma.orderItem.groupBy({
            by: ["productId"],
            _sum: { quantity: true, price: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: 5,
        });
        const products = await prisma_1.prisma.product.findMany({
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
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getTopProducts = getTopProducts;
const getInventory = async (req, res, next) => {
    try {
        const lowStockVariants = await prisma_1.prisma.variant.findMany({
            where: { stock: { lt: 5 } },
            include: { product: { select: { name: true } } },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: lowStockVariants });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventory = getInventory;
const createDiscount = async (req, res, next) => {
    try {
        const validatedData = common_validator_1.createDiscountSchema.parse(req.body);
        const discount = await prisma_1.prisma.discount.create({ data: validatedData });
        return (0, apiResponse_1.sendResponse)({ res, status: 201, success: true, data: discount });
    }
    catch (error) {
        next(error);
    }
};
exports.createDiscount = createDiscount;
const getDiscounts = async (req, res, next) => {
    try {
        const discounts = await prisma_1.prisma.discount.findMany();
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: discounts });
    }
    catch (error) {
        next(error);
    }
};
exports.getDiscounts = getDiscounts;
