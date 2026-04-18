"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const common_validator_1 = require("../validators/common.validator");
const AppError_1 = require("../utils/AppError");
const getCategories = async (req, res, next) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: true,
                _count: { select: { products: true } },
            },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res, next) => {
    try {
        const { parentId, ...rest } = common_validator_1.categorySchema.parse(req.body);
        const category = await prisma_1.prisma.category.create({
            data: {
                ...rest,
                ...(parentId ? { parent: { connect: { id: parentId } } } : {})
            }
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 201, success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { parentId, ...rest } = common_validator_1.categorySchema.partial().parse(req.body);
        const category = await prisma_1.prisma.category.update({
            where: { id: String(id) },
            data: {
                ...rest,
                ...(parentId === null
                    ? { parent: { disconnect: true } }
                    : parentId
                        ? { parent: { connect: { id: parentId } } }
                        : {})
            },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: category });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Category not found");
        }
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.category.delete({ where: { id: String(id) } });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Category deleted" });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Category not found");
        }
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
