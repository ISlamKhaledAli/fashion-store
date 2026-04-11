"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductBySlug = exports.getProducts = void 0;
const server_1 = require("../server");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const product_validator_1 = require("../validators/product.validator");
const getProducts = async (req, res, next) => {
    try {
        const { category, brand, minPrice, maxPrice, search, sort, page, limit } = req.query;
        const { skip, limit: take, page: currentPage } = (0, pagination_1.getPagination)({
            page: Number(page),
            limit: Number(limit),
        });
        const where = {
            status: "ACTIVE",
        };
        if (category)
            where.category = { slug: String(category) };
        if (brand)
            where.brand = { slug: String(brand) };
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = Number(minPrice);
            if (maxPrice)
                where.price.lte = Number(maxPrice);
        }
        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: "insensitive" } },
                { description: { contains: String(search), mode: "insensitive" } },
            ];
        }
        const orderBy = {};
        if (sort) {
            const [field, order] = String(sort).split(":");
            orderBy[field] = order || "asc";
        }
        else {
            orderBy.createdAt = "desc";
        }
        const [products, total] = await Promise.all([
            server_1.prisma.product.findMany({
                where,
                take,
                skip,
                orderBy,
                include: {
                    category: true,
                    brand: true,
                    images: { where: { isMain: true } },
                },
            }),
            server_1.prisma.product.count({ where }),
        ]);
        const pagination = (0, pagination_1.calculatePagination)(total, currentPage, take);
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 200,
            success: true,
            data: products,
            pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await server_1.prisma.product.findUnique({
            where: { slug: String(slug) },
            include: {
                category: true,
                brand: true,
                images: true,
                variants: true,
                reviews: {
                    include: { user: { select: { name: true, avatar: true } } },
                },
            },
        }); // Cast to any to bypass complex inferred type issues for this demo
        if (!product) {
            return (0, apiResponse_1.sendResponse)({ res, status: 404, success: false, message: "Product not found" });
        }
        // Calculate average rating
        const avgRating = product.reviews.length > 0
            ? product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length
            : 0;
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 200,
            success: true,
            data: { ...product, avgRating },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductBySlug = getProductBySlug;
const createProduct = async (req, res, next) => {
    try {
        const validatedData = product_validator_1.createProductSchema.parse(req.body);
        const { variants, ...productData } = validatedData;
        const product = await server_1.prisma.product.create({
            data: {
                ...productData,
                slug: productData.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
                variants: {
                    create: variants,
                },
            },
            include: {
                variants: true,
            },
        });
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 201,
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = product_validator_1.updateProductSchema.parse(req.body);
        const { variants, ...productData } = validatedData;
        // Handle variants separately if provided
        if (variants) {
            // For simplicity in this demo, we'll replace variants or update them
            // In production, we'd handle upsert logic
            await server_1.prisma.variant.deleteMany({ where: { productId: String(id) } });
            await server_1.prisma.variant.createMany({
                data: variants.map(v => ({ ...v, productId: String(id) })),
            });
        }
        const product = await server_1.prisma.product.update({
            where: { id: String(id) },
            data: productData,
            include: { variants: true },
        });
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 200,
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await server_1.prisma.product.update({
            where: { id: String(id) },
            data: { status: "ARCHIVED" },
        });
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 200,
            success: true,
            message: "Product archived successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
