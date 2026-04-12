"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = ({ res, status, success, message, data, pagination, errors, stack, }) => {
    return res.status(status).json({
        success,
        message,
        data,
        pagination,
        errors,
        stack,
    });
};
exports.sendResponse = sendResponse;
