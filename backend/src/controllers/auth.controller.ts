import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sendResponse } from "../utils/apiResponse";
import { registerSchema, loginSchema, refreshSchema } from "../validators/auth.validator";
import { AuthError, ConflictError, NotFoundError } from "../utils/AppError";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new ConflictError("User already exists with this email");
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return sendResponse({
      res,
      status: 201,
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !(await comparePassword(validatedData.password, user.password))) {
      throw new AuthError("Invalid email or password");
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new AuthError("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const accessToken = generateAccessToken(user.id, user.role);
    return sendResponse({
      res,
      status: 200,
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  return sendResponse({
    res,
    status: 200,
    success: true,
    message: "Logged out successfully",
  });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return sendResponse({ res, status: 200, success: true, data: user });
  } catch (error) {
    next(error);
  }
};
