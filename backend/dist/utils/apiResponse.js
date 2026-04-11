"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = ({ res, status, success, message, data, pagination, errors, }) => {
    return res.status(status).json({
        success,
        message,
        data,
        pagination,
        errors,
    });
};
exports.sendResponse = sendResponse;
