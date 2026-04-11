export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const getPagination = (options: PaginationOptions) => {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 10;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

export const calculatePagination = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
};
