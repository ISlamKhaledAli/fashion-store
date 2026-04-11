"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 403,
            success: false,
            message: "Access denied. Admin privileges required.",
        });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
