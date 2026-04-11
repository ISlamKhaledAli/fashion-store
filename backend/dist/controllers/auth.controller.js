"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const server_1 = require("../server");
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
const auth_validator_1 = require("../validators/auth.validator");
const register = async (req, res, next) => {
    try {
        const validatedData = auth_validator_1.registerSchema.parse(req.body);
        const existingUser = await server_1.prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            return (0, apiResponse_1.sendResponse)({
                res,
                status: 400,
                success: false,
                message: "User already exists with this email",
            });
        }
        const hashedPassword = await (0, bcrypt_1.hashPassword)(validatedData.password);
        const user = await server_1.prisma.user.create({
            data: {
                ...validatedData,
                password: hashedPassword,
            },
        });
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        // Note: In a production app, we would store the refreshToken in the DB or Redis.
        // For now, we'll return it to the client.
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
        const user = await server_1.prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (!user || !(await (0, bcrypt_1.comparePassword)(validatedData.password, user.password))) {
            return (0, apiResponse_1.sendResponse)({
                res,
                status: 401,
                success: false,
                message: "Invalid email or password",
            });
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
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (!decoded) {
            return (0, apiResponse_1.sendResponse)({
                res, status: 401, success: false, message: "Invalid or expired refresh token"
            });
        }
        const user = await server_1.prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return (0, apiResponse_1.sendResponse)({ res, status: 404, success: false, message: "User not found" });
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
    // In a real app with stored tokens, we would delete the refresh token from DB.
    // Since we don't store it yet, logic is minimal.
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
        const user = await server_1.prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { id: true, name: true, email: true, role: true, avatar: true },
        });
        if (!user) {
            return (0, apiResponse_1.sendResponse)({ res, status: 404, success: false, message: "User not found" });
        }
        return (0, apiResponse_1.sendResponse)({ res, status: 200, success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
