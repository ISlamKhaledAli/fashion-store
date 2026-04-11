"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 401,
            success: false,
            message: "Authorization token required",
        });
    }
    const token = authHeader.split(" ")[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded) {
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 401,
            success: false,
            message: "Invalid or expired token",
        });
    }
    req.user = decoded;
    next();
};
exports.authMiddleware = authMiddleware;
