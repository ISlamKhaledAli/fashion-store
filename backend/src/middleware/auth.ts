import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendResponse } from "../utils/apiResponse";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse({
      res,
      status: 401,
      success: false,
      message: "Authorization token required",
    });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return sendResponse({
      res,
      status: 401,
      success: false,
      message: "Invalid or expired token",
    });
  }

  req.user = decoded;
  next();
};
