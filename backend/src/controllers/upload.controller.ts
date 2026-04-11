import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/apiResponse";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary";
import { ValidationError } from "../utils/AppError";

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    const result: any = await uploadToCloudinary(req.file);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      throw new ValidationError("Public ID is required");
    }

    await deleteFromCloudinary(publicId);

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
