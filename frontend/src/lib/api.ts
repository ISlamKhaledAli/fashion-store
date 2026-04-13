import api from "./axios";
import { 
  ApiResponse, 
  Product, 
  Category, 
  Brand,
  Order, 
  User, 
  WishlistItem,
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
  getBySlug: (slug: string) => 
    api.get<ApiResponse<Product>>(`/products/${slug}`),
  getFeatured: () => 
    api.get<ApiResponse<Product[]>>("/products", { params: { featured: true } }),
  getFilters: () => 
    api.get<ApiResponse<{ colors: { name: string; hex: string }[] }>>("/products/filters"),
  getReviews: (productId: string) => 
    api.get<ApiResponse<any[]>>(`/reviews/product/${productId}`),
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
    api.post<ApiResponse<any>>("/reviews", data),
  getMine: (productId: string) =>
    api.get<ApiResponse<any>>(`/reviews/mine/${productId}`),
};

export const addressApi = {
  getAll: () => api.get<ApiResponse<any[]>>("/addresses"),
  create: (data: Record<string, unknown>) => 
    api.post<ApiResponse<any>>("/addresses", data),
  update: (id: string, data: Record<string, unknown>) => 
    api.put<ApiResponse<any>>(`/addresses/${id}`, data),
  delete: (id: string) => 
    api.delete<ApiResponse<unknown>>(`/addresses/${id}`),
};

export const adminApi = {
  getAnalytics: () => 
    api.get<ApiResponse<unknown>>("/admin/analytics/overview"),
  getRevenue: () => 
    api.get<ApiResponse<unknown>>("/admin/analytics/revenue"),
  getOrders: (params: Record<string, unknown>) => 
    api.get<ApiResponse<Order[]>>("/admin/orders", { params }),
  updateOrderStatus: (id: string, status: string) => 
    api.put<ApiResponse<Order>>(`/admin/orders/${id}`, { status }),
  getCustomers: (params?: Record<string, unknown>) => 
    api.get<ApiResponse<unknown[]>>("/admin/customers", { params }),
};
