"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
const errorMiddleware = (err, req, res, next) => {
    console.error(err);
    if (err instanceof zod_1.ZodError) {
        const errors = err.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
        }));
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 400,
            success: false,
            message: "Validation failed",
            errors,
        });
    }
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    return (0, apiResponse_1.sendResponse)({
        res,
        status,
        success: false,
        message,
    });
};
exports.errorMiddleware = errorMiddleware;
