import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AuthError, ForbiddenError } from "../utils/AppError";


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new AuthError("Authorization token required");
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AuthError("Invalid or expired token");
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "ADMIN") {
    throw new ForbiddenError("Access denied. Admin privileges required.");
  }
  next();
};

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      // Ignore token validation failure and continue as guest
    }
  }
  next();
};
