import api from "./axios";
import { 
  ApiResponse, 
  Product, 
  Category, 
  Order, 
  User, 
  CartItem,
  PaginationData 
} from "@/types";

export const authApi = {
  login: (credentials: any) => 
    api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>("/auth/login", credentials),
  register: (data: any) => 
    api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>("/auth/register", data),
  getMe: () => 
    api.get<ApiResponse<User>>("/auth/me"),
  refresh: (refreshToken: string) => 
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>("/auth/refresh", { refreshToken }),
};

export const productApi = {
  getAll: (params: any) => 
    api.get<ApiResponse<Product[]>>("/products", { params }),
  getBySlug: (slug: string) => 
    api.get<ApiResponse<Product>>(`/products/slug/${slug}`),
  getFeatured: () => 
    api.get<ApiResponse<Product[]>>("/products", { params: { featured: true } }),
};

export const categoryApi = {
  getAll: () => 
    api.get<ApiResponse<Category[]>>("/categories"),
};

export const cartApi = {
  get: () => api.get<ApiResponse<any>>("/cart"),
  addItem: (variantId: string, quantity: number) => 
    api.post<ApiResponse<any>>("/cart", { variantId, quantity }),
  updateQuantity: (id: string, quantity: number) => 
    api.put<ApiResponse<any>>(`/cart/${id}`, { quantity }),
  removeItem: (id: string) => 
    api.delete<ApiResponse<any>>(`/cart/${id}`),
  clear: () => api.delete<ApiResponse<any>>("/cart"),
};

export const orderApi = {
  create: (data: any) => 
    api.post<ApiResponse<{ order: Order; clientSecret: string }>>("/orders", data),
  getMine: (params: any) => 
    api.get<ApiResponse<Order[]>>("/orders/my-orders", { params }),
  getById: (id: string) => 
    api.get<ApiResponse<Order>>(`/orders/${id}`),
  cancel: (id: string) => 
    api.put<ApiResponse<any>>(`/orders/${id}/cancel`),
};

export const adminApi = {
  getAnalytics: () => 
    api.get<ApiResponse<any>>("/admin/analytics/overview"),
  getRevenue: () => 
    api.get<ApiResponse<any>>("/admin/analytics/revenue"),
  getOrders: (params: any) => 
    api.get<ApiResponse<Order[]>>("/admin/orders", { params }),
  updateOrderStatus: (id: string, status: string) => 
    api.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status }),
  getCustomers: () => 
    api.get<ApiResponse<any[]>>("/admin/customers"),
};
