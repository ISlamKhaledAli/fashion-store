import jwt from "jsonwebtoken";
import { env } from "./validateEnv";

export const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: "1h" });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
};
