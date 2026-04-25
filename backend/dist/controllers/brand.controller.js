"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrand = exports.updateBrand = exports.createBrand = exports.getBrands = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const common_validator_1 = require("../validators/common.validator");
const AppError_1 = require("../utils/AppError");
const getBrands = async (req, res, next) => {
    try {
        const brands = await prisma_1.prisma.brand.findMany({
            include: {
                _count: { select: { products: true } }
            }
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: brands });
    }
    catch (error) {
        next(error);
    }
};
exports.getBrands = getBrands;
const createBrand = async (req, res, next) => {
    try {
        const validatedData = common_validator_1.brandSchema.parse(req.body);
        const brand = await prisma_1.prisma.brand.create({ data: validatedData });
        return (0, apiResponse_1.sendResponse)({ res, status: 201, success: true, data: brand });
    }
    catch (error) {
        next(error);
    }
};
exports.createBrand = createBrand;
const updateBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = common_validator_1.brandSchema.partial().parse(req.body);
        const brand = await prisma_1.prisma.brand.update({
            where: { id: String(id) },
            data: validatedData,
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: brand });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Brand not found");
        }
        next(error);
    }
};
exports.updateBrand = updateBrand;
const deleteBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.brand.delete({ where: { id: String(id) } });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Brand deleted" });
    }
    catch (error) {
        if (error instanceof Error && error.code === "P2025") {
            throw new AppError_1.NotFoundError("Brand not found");
        }
        next(error);
    }
};
exports.deleteBrand = deleteBrand;
