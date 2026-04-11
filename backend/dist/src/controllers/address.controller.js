"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddresses = void 0;
const server_1 = require("../server");
const apiResponse_1 = require("../utils/apiResponse");
const address_validator_1 = require("../validators/address.validator");
const AppError_1 = require("../utils/AppError");
const getAddresses = async (req, res, next) => {
    try {
        const addresses = await server_1.prisma.address.findMany({
            where: { userId: req.user?.id },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: addresses });
    }
    catch (error) {
        next(error);
    }
};
exports.getAddresses = getAddresses;
const createAddress = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const validatedData = address_validator_1.addressSchema.parse(req.body);
        if (validatedData.isDefault) {
            await server_1.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const address = await server_1.prisma.address.create({
            data: { ...validatedData, userId },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 201, success: true, data: address });
    }
    catch (error) {
        next(error);
    }
};
exports.createAddress = createAddress;
const updateAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const validatedData = address_validator_1.addressSchema.partial().parse(req.body);
        const existingAddress = await server_1.prisma.address.findUnique({
            where: { id: String(id), userId }
        });
        if (!existingAddress) {
            throw new AppError_1.NotFoundError("Address not found");
        }
        if (validatedData.isDefault) {
            await server_1.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const address = await server_1.prisma.address.update({
            where: { id: String(id), userId },
            data: validatedData,
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: address });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const existingAddress = await server_1.prisma.address.findUnique({
            where: { id: String(id), userId }
        });
        if (!existingAddress) {
            throw new AppError_1.NotFoundError("Address not found");
        }
        await server_1.prisma.address.delete({
            where: { id: String(id), userId },
        });
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, message: "Address deleted" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
