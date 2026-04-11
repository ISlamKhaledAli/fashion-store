import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendResponse } from "../utils/apiResponse";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return sendResponse({
      res,
      status: 400,
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  return sendResponse({
    res,
    status,
    success: false,
    message,
  });
};
