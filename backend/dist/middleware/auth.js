"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
const authMiddleware = (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        throw new AppError_1.AuthError("Authorization token required");
    }
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        throw new AppError_1.AuthError("Invalid or expired token");
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== "ADMIN") {
        throw new AppError_1.AuthError("Admin resource. Access denied");
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
const optionalAuthMiddleware = (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (token) {
        try {
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            req.user = decoded;
        }
        catch (error) {
            // Ignore token validation failure and continue as guest
        }
    }
    next();
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
