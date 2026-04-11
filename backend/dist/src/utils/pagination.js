"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagination = exports.getPagination = void 0;
const getPagination = (options) => {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;
    return {
        page,
        limit,
        skip,
    };
};
exports.getPagination = getPagination;
const calculatePagination = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
    };
};
exports.calculatePagination = calculatePagination;
