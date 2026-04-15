import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { AppError, AuthError, ConflictError, NotFoundError } from "../utils/AppError";
import logger from "../utils/logger";
import { sendResponse } from "../utils/apiResponse";
import { env } from "../utils/validateEnv";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors: any[] | undefined = undefined;

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      const target = (err.meta?.target as string[])?.join(", ") || "field";
      message = `Unique constraint failed on ${target}`;
      console.error("[PRISMA CONFLICT]", err.meta);
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    }
  }

  // Handle JWT Errors
  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = err instanceof jwt.TokenExpiredError ? "Token expired" : "Invalid token";
  }

  // Handle Zod Error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  // Log 500 errors
  if (statusCode === 500) {
    logger.error(`${req.method} ${req.url} - ${err.message}`, {
      stack: err.stack,
      metadata: err,
    });
  } else {
    logger.warn(`${req.method} ${req.url} - ${statusCode} - ${message}`);
  }

  return sendResponse({
    res,
    status: statusCode,
    success: false,
    message,
    errors,
    // Include stack trace only in development
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
