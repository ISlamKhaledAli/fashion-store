"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const cloudinary_1 = require("../services/cloudinary");
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return (0, apiResponse_1.sendResponse)({ res, status: 400, success: false, message: "No file uploaded" });
        }
        const result = await (0, cloudinary_1.uploadToCloudinary)(req.file);
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 200,
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadImage = uploadImage;
const deleteImage = async (req, res, next) => {
    try {
        const { publicId } = req.body;
        if (!publicId) {
            return (0, apiResponse_1.sendResponse)({ res, status: 400, success: false, message: "Public ID is required" });
        }
        await (0, cloudinary_1.deleteFromCloudinary)(publicId);
        return (0, apiResponse_1.sendResponse)({
            res,
            status: 200,
            success: true,
            message: "Image deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteImage = deleteImage;
