import api from "./axios";
import type {
  User,
  Address,
  Category,
  Brand,
  Product,
  Order,
  WishlistItem,
  Review,
  ApiResponse,
  OrderStatus,
  AdminCustomer,
  UserMeasurements,
  ContactMessage,
  ContactMessageStatus,
  SiteContentItem,
  NewsletterSubscriber,
  NewsletterListResponse,
  NewsletterStatus,
  Rental,
  RentalAvailabilityResponse,
  Notification,
  ReturnRequest,
  ShippingZone,
  StoreSettingsMap,
  AuditLog,
  Customer360Profile,
  Banner,
} from "@/types";

export const authApi = {
  login: (credentials: Record<string, unknown>) =>
    api.post<ApiResponse<{ user: User }>>("/auth/login", credentials),
  register: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ user: User }>>("/auth/register", data),
  getMe: () => api.get<ApiResponse<User>>("/auth/me"),
  updateProfile: (
    data: Partial<Pick<User, "name" | "email" | "phone" | "avatar">>
  ) => api.put<ApiResponse<User>>("/auth/profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<null>>("/auth/password", data),
  logout: () => api.post<ApiResponse<null>>("/auth/logout"),
};

export const productApi = {
  getAll: (params: Record<string, unknown>) =>
    api.get<ApiResponse<Product[]>>("/products", { params }),
  getByIdentifier: (identifier: string) =>
    api.get<ApiResponse<Product>>(`/products/${identifier}`),
  getFeatured: () =>
    api.get<ApiResponse<Product[]>>("/products", {
      params: { featured: true },
    }),
  getFilters: () =>
    api.get<ApiResponse<{ colors: { name: string; hex: string }[] }>>(
      "/products/filters"
    ),
  getReviews: (productId: string) =>
    api.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`),
  getRecommendations: (productId: string) =>
    api.get<{ success: boolean; source: string; recommendations: Product[] }>(
      `/products/${productId}/recommendations`
    ),
};

export const categoryApi = {
  getAll: () => api.get<ApiResponse<Category[]>>("/categories"),
};

export const brandApi = {
  getAll: () => api.get<ApiResponse<Brand[]>>("/brands"),
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
    api.post<
      ApiResponse<{ valid: boolean; discountAmount: number; message?: string }>
    >("/discounts/validate", { code, orderTotal }),
  getShippingMethods: () =>
    api.get<
      ApiResponse<{ id: string; name: string; time: string; rate: number }[]>
    >("/cart/shipping-methods"),
  calculateTotals: (
    shippingMethod: string = "standard",
    promoCode?: string,
    options?: { country?: string; addressId?: string }
  ) =>
    api.post<
      ApiResponse<{
        subtotal: number;
        discountAmount: number;
        discountedSubtotal: number;
        shippingCost: number;
        tax: number;
        total: number;
      }>
    >("/cart/calculate", {
      shippingMethod,
      promoCode,
      country: options?.country,
      addressId: options?.addressId,
    }),
};

export const orderApi = {
  getMine: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<Order[]>>("/orders", { params }),
  create: (data: {
    addressId: string | null;
    stripePaymentId?: string;
    notes?: string;
    shippingMethod?: string;
    promoCode?: string;
    items?: Array<{
      variantId: string;
      productId: string;
      quantity: number;
      price: number;
    }>;
  }) => api.post<ApiResponse<{ order: Order }>>("/orders", data),
  updatePayment: (
    orderId: string,
    data: { stripePaymentId: string; paymentStatus: string }
  ) => api.put<ApiResponse<Order>>(`/orders/${orderId}/payment`, data),
  cancel: (id: string) => api.put<ApiResponse<unknown>>(`/orders/${id}/cancel`),
};

export const paymentApi = {
  createIntent: (data: {
    amount: number;
    shippingMethod?: string;
    promoCode?: string;
  }) =>
    api.post<
      ApiResponse<{
        clientSecret: string;
        paymentIntentId: string;
      }>
    >("/payment/intent", data),
};

export const wishlistApi = {
  getAll: () => api.get<ApiResponse<WishlistItem[]>>("/wishlist"),
  add: (productId: string) =>
    api.post<ApiResponse<WishlistItem>>("/wishlist/add", { productId }),
  remove: (productId: string) =>
    api.delete<ApiResponse<unknown>>(`/wishlist/remove/${productId}`),
};

export const reviewApi = {
  create: (data: {
    productId: string;
    rating: number;
    title: string;
    body: string;
  }) => api.post<ApiResponse<unknown>>("/reviews", data),
  getAdminReviews: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    rating?: number;
    search?: string;
  }) => api.get<ApiResponse<Review[]>>("/admin/reviews", { params }),
  updateStatus: (id: string, status: "APPROVED" | "REJECTED" | "PENDING") =>
    api.patch<ApiResponse<Review>>(`/admin/reviews/${id}/status`, { status }),
  reply: (id: string, reply: string) =>
    api.post<ApiResponse<Review>>(`/admin/reviews/${id}/reply`, { reply }),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/admin/reviews/${id}`),
};

export const addressApi = {
  getAll: () => api.get<ApiResponse<Address[]>>("/addresses"),
  create: (data: Omit<Address, "id">) =>
    api.post<ApiResponse<Address>>("/addresses", data),
  update: (id: string, data: Partial<Omit<Address, "id">>) =>
    api.put<ApiResponse<Address>>(`/addresses/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/addresses/${id}`),
};

export const adminApi = {
  getAnalytics: () =>
    api.get<ApiResponse<unknown>>("/admin/analytics/overview"),
  getRevenue: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<unknown>>("/admin/analytics/revenue", { params }),
  getTopProducts: () =>
    api.get<ApiResponse<unknown>>("/admin/analytics/top-products"),
  getGeographicData: () =>
    api.get<ApiResponse<unknown>>("/admin/analytics/geographic"),
  getCategoryRevenue: () =>
    api.get<ApiResponse<unknown>>("/admin/analytics/categories"),
  getCustomerRetention: () =>
    api.get<ApiResponse<unknown>>("/admin/analytics/retention"),
  getOrders: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
  }) => api.get<ApiResponse<Order[]>>("/admin/orders", { params }),
  updateOrderStatus: (
    id: string,
    data:
      | {
          status?: OrderStatus;
          trackingNumber?: string;
          carrier?: string;
        }
      | OrderStatus
  ) => {
    const payload = typeof data === "string" ? { status: data } : data;
    return api.put<ApiResponse<Order>>(`/admin/orders/${id}`, payload);
  },
  updateOrderInternalNotes: (id: string, internalNotes: string) =>
    api.put<ApiResponse<Order>>(`/admin/orders/${id}/notes`, { internalNotes }),
  cancelOrder: (id: string, reason?: string, restock: boolean = true) =>
    api.post<ApiResponse<Order>>(`/admin/orders/${id}/cancel`, {
      reason,
      restock,
    }),
  bulkUpdateOrderStatus: (ids: string[], status: OrderStatus) =>
    api.post<ApiResponse<unknown>>("/admin/orders/bulk-status", {
      ids,
      status,
    }),
  bulkDeleteOrders: (ids: string[]) =>
    api.post<ApiResponse<unknown>>("/admin/orders/bulk-delete", { ids }),
  getCustomers: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<AdminCustomer[]>>("/admin/customers", { params }),
  getCustomer360: (id: string) =>
    api.get<ApiResponse<Customer360Profile>>(`/admin/customers/${id}/360`),
  updateCustomerDetails: (
    id: string,
    data: {
      tags?: string[];
      adminNotes?: string | null;
      status?: "ACTIVE" | "BANNED";
      role?: "CUSTOMER" | "ADMIN";
    }
  ) => api.put<ApiResponse<unknown>>(`/admin/customers/${id}/details`, data),
  updateCustomerStatus: (id: string, status: "ACTIVE" | "BANNED") =>
    api.put<ApiResponse<unknown>>(`/admin/customers/${id}/status`, { status }),
  getProducts: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<Product[]>>("/admin/products", { params }),
  bulkUpdateProductStatus: (
    ids: string[],
    status: "ACTIVE" | "DRAFT" | "ARCHIVED"
  ) =>
    api.post<ApiResponse<unknown>>("/admin/products/bulk-status", {
      ids,
      status,
    }),
  bulkDeleteProducts: (ids: string[]) =>
    api.post<ApiResponse<{ deletedCount: number; archivedCount: number }>>(
      "/admin/products/bulk-delete",
      { ids }
    ),
  getAuditLogs: (params?: {
    action?: string;
    entity?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<AuditLog[]>>("/admin/audit-logs", { params }),
  getBrands: () => api.get<ApiResponse<Brand[]>>("/brands"),
  getProductById: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/admin/${id}`),
  createProduct: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Product>>("/products", data),
  updateProduct: (id: string, data: Record<string, unknown>) => {
    // Rely on product.validator.ts on the backend to strip unused fields
    return api.put<ApiResponse<Product>>(`/products/${id}`, data);
  },
  updateProductImage: (
    productId: string,
    imageId: string,
    data: { variantColor?: string | null; isMain?: boolean; position?: number }
  ) =>
    api.put<ApiResponse<unknown>>(
      `/products/${productId}/images/${imageId}`,
      data
    ),
  deleteProduct: (id: string) =>
    api.delete<ApiResponse<unknown>>(`/products/${id}`),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<ApiResponse<{ url: string; publicId: string }>>(
      "/upload/image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
  getCategories: () => api.get<ApiResponse<Category[]>>("/admin/categories"),
  createCategory: (data: Partial<Category>) =>
    api.post<ApiResponse<Category>>("/categories", data),
  updateCategory: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/categories/${id}`, data),
  reorderCategories: (
    items: { id: string; position: number; parentId: string | null }[]
  ) => api.post<ApiResponse<unknown>>("/admin/categories/reorder", { items }),
  deleteCategory: (id: string) =>
    api.delete<ApiResponse<unknown>>(`/categories/${id}`),
  createBrand: (data: Partial<Brand>) =>
    api.post<ApiResponse<Brand>>("/brands", data),
  updateBrand: (id: string, data: Partial<Brand>) =>
    api.put<ApiResponse<Brand>>(`/brands/${id}`, data),
  deleteBrand: (id: string) =>
    api.delete<ApiResponse<unknown>>(`/brands/${id}`),
  getInventory: () => api.get<ApiResponse<Product[]>>("/admin/inventory"),
  updateStock: (variantId: string, stock: number) =>
    api.put<ApiResponse<unknown>>(`/admin/inventory/${variantId}`, { stock }),
  getDiscounts: () =>
    api.get<ApiResponse<Record<string, unknown>[]>>("/admin/discounts"),
  createDiscount: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Record<string, unknown>>>("/admin/discounts", data),
  updateDiscount: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Record<string, unknown>>>(
      `/admin/discounts/${id}`,
      data
    ),
  deleteDiscount: (id: string) =>
    api.delete<ApiResponse<unknown>>(`/admin/discounts/${id}`),
  generateDescription: (data: {
    productName: string;
    category?: string;
    brand?: string;
    price?: number;
    colors?: string[];
    sizes?: string[];
    images?: string[];
  }) =>
    api.post<{
      success: boolean;
      description?: string;
      data?: { description?: string };
    }>("/admin/ai/generate-description", data, { withCredentials: true }),
  generateAccordion: (data: {
    title: string;
    productName: string;
    category?: string;
    brand?: string;
  }) =>
    api.post<{ success: boolean; content: string }>(
      "/admin/ai/generate-accordion",
      data,
      { withCredentials: true }
    ),
  generateFeatures: (data: {
    productName: string;
    description?: string;
    category?: string;
    brand?: string;
  }) =>
    api.post<{
      success: boolean;
      features: { icon: string; title: string; description: string }[];
    }>("/admin/ai/generate-features", data, { withCredentials: true }),
  generateAllAccordions: (data: {
    productName: string;
    description?: string;
    category?: string;
    brand?: string;
  }) =>
    api.post<{
      success: boolean;
      details: { title: string; content: string }[];
    }>("/admin/ai/generate-all-accordions", data, { withCredentials: true }),
};

export const sizeApi = {
  getMeasurements: () =>
    api.get<ApiResponse<UserMeasurements | null>>("/size/measurements"),
  updateMeasurements: (data: UserMeasurements) =>
    api.put<ApiResponse<UserMeasurements>>("/size/measurements", data),
  clearMeasurements: () => api.delete<ApiResponse<null>>("/size/measurements"),
};

export const contentApi = {
  getByKey: <T>(key: string) => api.get<ApiResponse<T>>(`/content/${key}`),
  getAll: () =>
    api.get<
      ApiResponse<{
        items: SiteContentItem[];
        map: Record<string, unknown>;
      }>
    >("/content"),
  upsert: <T>(key: string, data: T) =>
    api.put<ApiResponse<SiteContentItem>>(`/content/${key}`, { data }),
  bulkUpsert: (items: Record<string, unknown>) =>
    api.post<ApiResponse<SiteContentItem[]>>("/content/bulk", { items }),
};

export const contactApi = {
  submit: (data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }) => api.post<ApiResponse<ContactMessage>>("/contact", data),
  getMessages: (params?: {
    page?: number;
    limit?: number;
    status?: ContactMessageStatus;
  }) => api.get<ApiResponse<ContactMessage[]>>("/contact", { params }),
  updateStatus: (
    id: string,
    data: { status: ContactMessageStatus; notes?: string }
  ) => api.patch<ApiResponse<ContactMessage>>(`/contact/${id}/status`, data),
  deleteMessage: (id: string) =>
    api.delete<ApiResponse<null>>(`/contact/${id}`),
};

export const newsletterApi = {
  subscribe: (email: string) =>
    api.post<ApiResponse<NewsletterSubscriber>>("/newsletter/subscribe", {
      email,
    }),
  unsubscribe: (email: string) =>
    api.post<ApiResponse<NewsletterSubscriber>>("/newsletter/unsubscribe", {
      email,
    }),
  getSubscribers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: NewsletterStatus;
  }) => api.get<ApiResponse<NewsletterListResponse>>("/newsletter", { params }),
  updateStatus: (id: string, status: NewsletterStatus) =>
    api.patch<ApiResponse<NewsletterSubscriber>>(`/newsletter/${id}/status`, {
      status,
    }),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/newsletter/${id}`),
  export: () =>
    api.get<ApiResponse<NewsletterSubscriber[]>>("/newsletter/export"),
  broadcast: (data: {
    subject: string;
    previewText?: string;
    content: string;
  }) =>
    api.post<ApiResponse<{ sentCount: number }>>("/newsletter/broadcast", data),
};

export const rentalApi = {
  checkAvailability: (
    variantId: string,
    params?: { startDate?: string; endDate?: string }
  ) =>
    api.get<ApiResponse<RentalAvailabilityResponse>>(
      `/rentals/availability/${variantId}`,
      { params }
    ),
  create: (data: {
    variantId: string;
    productId: string;
    rentalPeriodId?: string;
    startDate: string;
    endDate: string;
    fulfillment?: string;
    pickupLocation?: string;
    addressId?: string;
    notes?: string;
  }) =>
    api.post<ApiResponse<{ rental: Rental; clientSecret?: string | null }>>(
      "/rentals",
      data
    ),
  getMyRentals: () => api.get<ApiResponse<Rental[]>>("/rentals"),
  getById: (id: string) => api.get<ApiResponse<Rental>>(`/rentals/${id}`),
  confirmPayment: (id: string, data: { stripePaymentId?: string }) =>
    api.put<ApiResponse<Rental>>(`/rentals/${id}/payment`, data),
  requestReturn: (id: string, data?: { notes?: string }) =>
    api.post<ApiResponse<Rental>>(`/rentals/${id}/return`, data || {}),
  cancel: (id: string) => api.put<ApiResponse<Rental>>(`/rentals/${id}/cancel`),
  getSalons: () =>
    api.get<ApiResponse<Array<{ name: string; address: string }>>>(
      "/rentals/salons"
    ),
};

export const notificationApi = {
  getAll: (params?: { unreadOnly?: boolean; page?: number; limit?: number }) =>
    api.get<ApiResponse<Notification[]>>("/notifications", { params }),
  getUnreadCount: () =>
    api.get<ApiResponse<{ unreadCount: number }>>(
      "/notifications/unread-count"
    ),
  markAsRead: (id: string) =>
    api.put<ApiResponse<Notification>>(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.put<ApiResponse<{ message: string }>>("/notifications/read-all"),
  delete: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/notifications/${id}`),
  broadcast: (data: {
    title: string;
    message: string;
    type?: string;
    target?: string;
  }) =>
    api.post<ApiResponse<{ count?: number }>>("/notifications/broadcast", data),
};

export const returnApi = {
  create: (data: {
    orderId: string;
    reason: string;
    description?: string;
    images?: string[];
  }) => api.post<ApiResponse<ReturnRequest>>("/returns", data),
  getMyReturns: () => api.get<ApiResponse<ReturnRequest[]>>("/returns"),
  getAdminReturns: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<ReturnRequest[]>>("/returns/admin", { params }),
  updateAdminStatus: (
    id: string,
    data: { status: string; adminNotes?: string; refundAmount?: number }
  ) => api.put<ApiResponse<ReturnRequest>>(`/returns/admin/${id}/status`, data),
  processAdminRefund: (id: string, data?: { amount?: number }) =>
    api.post<ApiResponse<ReturnRequest>>(
      `/returns/admin/${id}/refund`,
      data || {}
    ),
};

export const adminRentalApi = {
  getAll: (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<Rental[]>>("/admin/rentals", { params }),
  updateStatus: (
    id: string,
    data: { status: string; notes?: string; lateFee?: number }
  ) => api.put<ApiResponse<Rental>>(`/admin/rentals/${id}/status`, data),
  refundDeposit: (id: string) =>
    api.post<ApiResponse<Rental>>(`/admin/rentals/${id}/deposit`),
  addLateFee: (id: string, fee: number) =>
    api.post<ApiResponse<Rental>>(`/admin/rentals/${id}/late-fee`, { fee }),
  getAnalytics: () =>
    api.get<
      ApiResponse<{
        totalRentals: number;
        activeRentals: number;
        overdueRentals: number;
        returnedRentals: number;
        totalRentalRevenue: number;
        depositsHeld: number;
      }>
    >("/admin/rentals/analytics"),
};

export const adminSettingsApi = {
  getSettings: () => api.get<ApiResponse<StoreSettingsMap>>("/admin/settings"),
  updateSetting: (key: string, value: unknown) =>
    api.put<ApiResponse<unknown>>(`/admin/settings/${key}`, { value }),
};

export const adminShippingApi = {
  getZones: () => api.get<ApiResponse<ShippingZone[]>>("/admin/shipping-zones"),
  createZone: (data: Partial<ShippingZone>) =>
    api.post<ApiResponse<ShippingZone>>("/admin/shipping-zones", data),
  updateZone: (id: string, data: Partial<ShippingZone>) =>
    api.put<ApiResponse<ShippingZone>>(`/admin/shipping-zones/${id}`, data),
  deleteZone: (id: string) =>
    api.delete<ApiResponse<null>>(`/admin/shipping-zones/${id}`),
};

export const bannerApi = {
  getBanners: () => api.get<ApiResponse<Banner[]>>("/banners"),
};

export const adminBannerApi = {
  getBanners: () => api.get<ApiResponse<Banner[]>>("/admin/banners"),
  createBanner: (data: Partial<Banner>) =>
    api.post<ApiResponse<Banner>>("/admin/banners", data),
  updateBanner: (id: string, data: Partial<Banner>) =>
    api.put<ApiResponse<Banner>>(`/admin/banners/${id}`, data),
  deleteBanner: (id: string) =>
    api.delete<ApiResponse<null>>(`/admin/banners/${id}`),
};
