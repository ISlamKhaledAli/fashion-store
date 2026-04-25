"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeographicData = exports.deleteDiscount = exports.updateDiscount = exports.getDiscounts = exports.createDiscount = exports.updateInventoryStock = exports.getInventory = exports.getCustomerRetention = exports.getCategoryRevenue = exports.getTopProducts = exports.getRevenueAnalytics = exports.getAnalyticsOverview = exports.deleteCustomer = exports.updateCustomerStatus = exports.getCustomers = exports.bulkDeleteOrders = exports.bulkUpdateOrdersStatus = exports.updateOrderStatus = exports.getAdminOrders = exports.reorderCategories = exports.getAdminCategories = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const common_validator_1 = require("../validators/common.validator");
const AppError_1 = require("../utils/AppError");
const getAdminCategories = async (req, res, next) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            include: {
                _count: { select: { products: true } },
            },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdminCategories = getAdminCategories;
const reorderCategories = async (req, res, next) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return (0, apiResponse_1.sendResponse)({ res, status: 400, success: false, message: "Invalid payload format" });
        }
        // Use a transaction to perform bulk updates efficiently
        await prisma_1.prisma.$transaction(items.map((item) => prisma_1.prisma.category.update({
            where: { id: item.id },
            data: {
                position: item.position,
                ...(item.parentId === null
                    ? { parent: { disconnect: true } }
                    : item.parentId
                        ? { parent: { connect: { id: item.parentId } } }
                        : {})
            },
        })));
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Categories reordered successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.reorderCategories = reorderCategories;
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
        const { search, status } = req.query;
        const where = { role: "CUSTOMER" };
        if (status && status !== "ALL") {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: "insensitive" } },
                { email: { contains: String(search), mode: "insensitive" } },
            ];
        }
        const customers = await prisma_1.prisma.user.findMany({
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
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: customersWithStats });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomers = getCustomers;
const updateCustomerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: String(id) },
            data: { status },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomerStatus = updateCustomerStatus;
const deleteCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Optional: Check if user has orders before deleting, or use cascade
        await prisma_1.prisma.user.delete({
            where: { id: String(id) },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Customer profile purged" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCustomer = deleteCustomer;
const getAnalyticsOverview = async (req, res, next) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        // Current period (0-30 days)
        const [totalRevenue, totalOrders, totalCustomers, paidOrdersCount] = await Promise.all([
            prisma_1.prisma.order.aggregate({
                where: { paymentStatus: "PAID" },
                _sum: { total: true },
            }),
            prisma_1.prisma.order.count(),
            prisma_1.prisma.user.count({ where: { role: "CUSTOMER" } }),
            prisma_1.prisma.order.count({ where: { paymentStatus: "PAID" } }),
        ]);
        // Trend calculation data
        const [prevRevenue, prevOrders, prevCustomers, prevPaidOrders] = await Promise.all([
            prisma_1.prisma.order.aggregate({
                where: { paymentStatus: "PAID", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
                _sum: { total: true },
            }),
            prisma_1.prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma_1.prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma_1.prisma.order.count({ where: { paymentStatus: "PAID", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
        ]);
        const curRevenue = await prisma_1.prisma.order.aggregate({
            where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
            _sum: { total: true },
        });
        const curOrders = await prisma_1.prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
        const curCustomers = await prisma_1.prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: thirtyDaysAgo } } });
        const curPaidOrders = await prisma_1.prisma.order.count({ where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } } });
        // Calculate trends
        const calculateTrend = (current, previous) => {
            if (previous === 0)
                return current > 0 ? 100 : 0;
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
        const todayRevenue = await prisma_1.prisma.order.aggregate({
            where: { paymentStatus: "PAID", createdAt: { gte: startOfToday } },
            _sum: { total: true },
        });
        const [ordersToday, newCustomers, rawStatusCounts, dailyRevenueRaw] = await Promise.all([
            prisma_1.prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
            prisma_1.prisma.user.count({ where: { createdAt: { gte: startOfToday }, role: 'CUSTOMER' } }),
            prisma_1.prisma.order.groupBy({ by: ['status'], _count: true }),
            prisma_1.prisma.order.groupBy({
                by: ['createdAt'],
                where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
                _sum: { total: true },
                orderBy: { createdAt: 'asc' }
            })
        ]);
        // Format daily revenue for sparklines
        const dailyRevenueMap = {};
        dailyRevenueRaw.forEach(day => {
            const date = day.createdAt.toISOString().split('T')[0];
            dailyRevenueMap[date] = (dailyRevenueMap[date] || 0) + (day._sum.total || 0);
        });
        const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, amount]) => ({ date, amount }));
        const statusCounts = rawStatusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {});
        return (0, apiResponse_1.sendResponse)({
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
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getTopProducts = getTopProducts;
const getCategoryRevenue = async (req, res, next) => {
    try {
        const orderItems = await prisma_1.prisma.orderItem.findMany({
            include: {
                product: {
                    include: { category: { select: { id: true, name: true } } },
                },
            },
        });
        const categoryMap = {};
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
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryRevenue = getCategoryRevenue;
const getCustomerRetention = async (req, res, next) => {
    try {
        // Get all customers with their order count
        const customers = await prisma_1.prisma.user.findMany({
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
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerRetention = getCustomerRetention;
const getInventory = async (req, res, next) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            include: {
                category: { select: { name: true } },
                images: true,
                variants: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: products });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventory = getInventory;
const updateInventoryStock = async (req, res, next) => {
    try {
        const { variantId } = req.params;
        const { stock } = req.body;
        if (stock === undefined || isNaN(parseInt(stock))) {
            return (0, apiResponse_1.sendResponse)({ res, status: 400, success: false, message: "Valid stock quantity is required" });
        }
        const variant = await prisma_1.prisma.variant.update({
            where: { id: String(variantId) },
            data: { stock: parseInt(stock) },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: variant, message: "Stock updated successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.updateInventoryStock = updateInventoryStock;
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
        const discounts = await prisma_1.prisma.discount.findMany({
            orderBy: { createdAt: "desc" }
        });
        // Fetch revenue per code for PAID orders
        const revenueData = await prisma_1.prisma.order.groupBy({
            by: ["promoCode"],
            where: { paymentStatus: "PAID", promoCode: { not: null } },
            _sum: { total: true }
        });
        const revenueMap = {};
        revenueData.forEach(item => {
            if (item.promoCode)
                revenueMap[item.promoCode] = item._sum.total || 0;
        });
        const discountsWithRevenue = discounts.map(d => ({
            ...d,
            revenueGenerated: revenueMap[d.code] || 0
        }));
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: discountsWithRevenue });
    }
    catch (error) {
        next(error);
    }
};
exports.getDiscounts = getDiscounts;
const updateDiscount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = common_validator_1.createDiscountSchema.partial().parse(req.body);
        const discount = await prisma_1.prisma.discount.update({
            where: { id: String(id) },
            data: validatedData
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: discount });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Discount not found");
        }
        next(error);
    }
};
exports.updateDiscount = updateDiscount;
const deleteDiscount = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.discount.delete({ where: { id: String(id) } });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Discount purged" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDiscount = deleteDiscount;
const getGeographicData = async (req, res, next) => {
    try {
        const orders = await prisma_1.prisma.order.findMany({
            where: { paymentStatus: "PAID" },
            select: {
                total: true,
                address: {
                    select: { country: true }
                }
            }
        });
        const countryMap = {};
        for (const order of orders) {
            const country = order.address?.country || "Unknown";
            if (!countryMap[country])
                countryMap[country] = { orders: 0, revenue: 0 };
            countryMap[country].orders += 1;
            countryMap[country].revenue += order.total;
        }
        const data = Object.entries(countryMap)
            .map(([country, stats]) => ({ country, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getGeographicData = getGeographicData;
