"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
const logger_1 = __importDefault(require("../utils/logger"));
const apiResponse_1 = require("../utils/apiResponse");
const validateEnv_1 = require("../utils/validateEnv");
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
    let errors = undefined;
    // Handle AppError
    if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle Prisma Errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = 409;
            message = `Unique constraint failed on ${err.meta?.target || "field"}`;
        }
        else if (err.code === "P2025") {
            statusCode = 404;
            message = "Record not found";
        }
    }
    // Handle JWT Errors
    if (err instanceof jsonwebtoken_1.default.JsonWebTokenError || err instanceof jsonwebtoken_1.default.TokenExpiredError) {
        statusCode = 401;
        message = err instanceof jsonwebtoken_1.default.TokenExpiredError ? "Token expired" : "Invalid token";
    }
    // Handle Zod Error
    if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = "Validation failed";
        errors = err.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
        }));
    }
    // Log 500 errors
    if (statusCode === 500) {
        logger_1.default.error(`${req.method} ${req.url} - ${err.message}`, {
            stack: err.stack,
            metadata: err,
        });
    }
    else {
        logger_1.default.warn(`${req.method} ${req.url} - ${statusCode} - ${message}`);
    }
    return (0, apiResponse_1.sendResponse)({
        res,
        status: statusCode,
        success: false,
        message,
        errors,
        // Include stack trace only in development
        stack: validateEnv_1.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
