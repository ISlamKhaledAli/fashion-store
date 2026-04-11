import { Response } from "express";

interface ApiResponseOptions {
  res: Response;
  status: number;
  success: boolean;
  message?: string;
  data?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: any[];
}

export const sendResponse = ({
  res,
  status,
  success,
  message,
  data,
  pagination,
  errors,
}: ApiResponseOptions) => {
  return res.status(status).json({
    success,
    message,
    data,
    pagination,
    errors,
  });
};
