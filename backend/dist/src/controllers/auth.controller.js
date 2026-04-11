"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
const auth_validator_1 = require("../validators/auth.validator");
const AppError_1 = require("../utils/AppError");
const register = async (req, res, next) => {
    try {
        const validatedData = auth_validator_1.registerSchema.parse(req.body);
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            throw new AppError_1.ConflictError("User already exists with this email");
        }
        const hashedPassword = await (0, bcrypt_1.hashPassword)(validatedData.password);
        const user = await prisma_1.prisma.user.create({
            data: {
                ...validatedData,
                password: hashedPassword,
            },
        });
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 201,
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const validatedData = auth_validator_1.loginSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (!user || !(await (0, bcrypt_1.comparePassword)(validatedData.password, user.password))) {
            throw new AppError_1.AuthError("Invalid email or password");
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 200,
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = auth_validator_1.refreshSchema.parse(req.body);
        let decoded;
        try {
            decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch (err) {
            throw new AppError_1.AuthError("Invalid or expired refresh token");
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            throw new AppError_1.NotFoundError("User not found");
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 200,
            success: true,
            data: { accessToken },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    return (0, apiResponse_1.sendResponse)({
        res,
        status: 200,
        success: true,
        message: "Logged out successfully",
    });
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { id: true, name: true, email: true, role: true, avatar: true },
        });
        if (!user) {
            throw new AppError_1.NotFoundError("User not found");
        }
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
