import api from "./axios";
import { 
  User, Category, Brand, Product, Order, 
  WishlistItem, Address, Review, ApiResponse, OrderStatus, AdminCustomer
} from "@/types";

export const authApi = {
  login: (credentials: Record<string, unknown>) => 
    api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>("/auth/login", credentials),
  register: (data: Record<string, unknown>) => 
    api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>("/auth/register", data),
  getMe: () => 
    api.get<ApiResponse<User>>("/auth/me"),
  refresh: (refreshToken: string) => 
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>("/auth/refresh", { refreshToken }),
};

export const productApi = {
  getAll: (params: Record<string, unknown>) => 
    api.get<ApiResponse<Product[]>>("/products", { params }),
  getByIdentifier: (identifier: string) => 
    api.get<ApiResponse<Product>>(`/products/${identifier}`),
  getFeatured: () => 
    api.get<ApiResponse<Product[]>>("/products", { params: { featured: true } }),
  getFilters: () => 
    api.get<ApiResponse<{ colors: { name: string; hex: string }[] }>>("/products/filters"),
  getReviews: (productId: string) => 
    api.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`),
};

export const categoryApi = {
  getAll: () => 
    api.get<ApiResponse<Category[]>>("/categories"),
};

export const brandApi = {
  getAll: () => 
    api.get<ApiResponse<Brand[]>>("/brands"),
};

export const cartApi = {
  get: () => api.get<ApiResponse<unknown>>("/cart"),
  addItem: (variantId: string, quantity: number) => 
    api.post<ApiResponse<unknown>>("/cart/add", { variantId, quantity }),
  updateQuantity: (cartItemId: string, quantity: number) => 
    api.put<ApiResponse<unknown>>("/cart/update", { cartItemId, quantity }),
  removeItem: (id: string) => 
    api.delete<ApiResponse<unknown>>(`/cart/remove/${id}`),
  clear: () => api.delete<ApiResponse<unknown>>("/cart/clear"),
  validatePromo: (code: string, orderTotal: number) => 
    api.post<ApiResponse<{ valid: boolean; discountAmount: number; message?: string }>>("/discounts/validate", { code, orderTotal }),
  getShippingMethods: () =>
    api.get<ApiResponse<{ id: string; name: string; time: string; rate: number }[]>>("/cart/shipping-methods"),
  calculateTotals: (shippingMethod: string = "standard", promoCode?: string) =>
    api.post<ApiResponse<{
      subtotal: number;
      discountAmount: number;
      discountedSubtotal: number;
      shippingCost: number;
      tax: number;
      total: number;
    }>>("/cart/calculate", { shippingMethod, promoCode }),
};

export const orderApi = {
  create: (data: Record<string, unknown>) => 
    api.post<ApiResponse<{ order: Order; clientSecret: string }>>("/orders", data),
  getMine: (params?: Record<string, unknown>) => 
    api.get<ApiResponse<Order[]>>("/orders", { params }),
  getById: (id: string) => 
    api.get<ApiResponse<Order>>(`/orders/${id}`),
  cancel: (id: string) => 
    api.put<ApiResponse<unknown>>(`/orders/${id}/cancel`),
};

export const wishlistApi = {
  getAll: () => api.get<ApiResponse<WishlistItem[]>>("/wishlist"),
  add: (productId: string) => 
    api.post<ApiResponse<WishlistItem>>("/wishlist/add", { productId }),
  remove: (productId: string) => 
    api.delete<ApiResponse<unknown>>(`/wishlist/remove/${productId}`),
};

export const reviewApi = {
  create: (data: { productId: string; rating: number; title: string; body: string }) =>
    api.post<ApiResponse<unknown>>("/reviews", data),
  getMine: (productId: string) =>
    api.get<ApiResponse<unknown>>(`/reviews/mine/${productId}`),
};

export const addressApi = {
  getAll: () => api.get<ApiResponse<unknown[]>>("/addresses"),
  create: (data: Record<string, unknown>) => 
    api.post<ApiResponse<unknown>>("/addresses", data),
  update: (id: string, data: Record<string, unknown>) => 
    api.put<ApiResponse<unknown>>(`/addresses/${id}`, data),
  delete: (id: string) => 
    api.delete<ApiResponse<unknown>>(`/addresses/${id}`),
};

export const adminApi = {
  getAnalytics: () => 
    api.get<ApiResponse<unknown>>("/admin/analytics/overview"),
  getRevenue: (params?: Record<string, unknown>) => 
    api.get<ApiResponse<unknown>>("/admin/analytics/revenue", { params }),
  getTopProducts: () => 
    api.get<ApiResponse<unknown>>("/admin/analytics/top-products"),
  getOrders: (params: { page?: number; limit?: number; search?: string; status?: OrderStatus }) => 
    api.get<ApiResponse<Order[]>>("/admin/orders", { params }),
  updateOrderStatus: (id: string, status: OrderStatus) => 
    api.put<ApiResponse<Order>>(`/admin/orders/${id}`, { status }),
  bulkUpdateOrderStatus: (ids: string[], status: OrderStatus) =>
    api.post<ApiResponse<unknown>>("/admin/orders/bulk-status", { ids, status }),
  bulkDeleteOrders: (ids: string[]) =>
    api.post<ApiResponse<unknown>>("/admin/orders/bulk-delete", { ids }),
  getCustomers: (params?: Record<string, unknown>) => 
    api.get<ApiResponse<AdminCustomer[]>>("/admin/customers", { params }),
  updateCustomerStatus: (id: string, status: 'ACTIVE' | 'BANNED') =>
    api.put<ApiResponse<unknown>>(`/admin/customers/${id}/status`, { status }),
  deleteCustomer: (id: string) =>
    api.delete<ApiResponse<unknown>>(`/admin/customers/${id}`),
  getProducts: (params?: Record<string, unknown>) => 
    api.get<ApiResponse<Product[]>>("/admin/products", { params }),
  getProductById: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/admin/${id}`),
  createProduct: (data: Record<string, unknown>) => 
    api.post<ApiResponse<Product>>("/products", data),
  updateProduct: (id: string, data: Record<string, unknown>) => {
    // Rely on product.validator.ts on the backend to strip unused fields
    return api.put<ApiResponse<Product>>(`/products/${id}`, data);
  },
  deleteProduct: (id: string) => 
    api.delete<ApiResponse<unknown>>(`/products/${id}`),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<ApiResponse<{ url: string; publicId: string }>>("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getCategories: () =>
    api.get<ApiResponse<Category[]>>("/admin/categories"),
  createCategory: (data: Partial<Category>) =>
    api.post<ApiResponse<Category>>("/categories", data),
  updateCategory: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/categories/${id}`, data),
  reorderCategories: (items: { id: string; position: number; parentId: string | null }[]) =>
    api.post<ApiResponse<unknown>>("/admin/categories/reorder", { items }),
  deleteCategory: (id: string) =>
    api.delete<ApiResponse<unknown>>(`/categories/${id}`),
};
