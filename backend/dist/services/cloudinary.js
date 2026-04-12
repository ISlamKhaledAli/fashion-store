"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const validateEnv_1 = require("../utils/validateEnv");
cloudinary_1.v2.config({
    cloud_name: validateEnv_1.env.CLOUDINARY_CLOUD_NAME,
    api_key: validateEnv_1.env.CLOUDINARY_API_KEY,
    api_secret: validateEnv_1.env.CLOUDINARY_API_SECRET,
});
const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: "fashion-store",
        }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result);
        });
        uploadStream.end(file.buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    return await cloudinary_1.v2.uploader.destroy(publicId);
};
exports.deleteFromCloudinary = deleteFromCloudinary;
