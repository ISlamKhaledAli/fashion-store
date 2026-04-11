import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/apiResponse";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return sendResponse({
      res,
      status: 403,
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};
