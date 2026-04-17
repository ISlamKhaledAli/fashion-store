export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  publicId: string;
  isMain: boolean;
}

export interface Variant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  featured: boolean;
  categoryId: string;
  brandId: string;
  category?: Category;
  brand?: Brand;
  images: ProductImage[];
  variants: Variant[];
  avgRating?: number | null;
  reviewCount?: number;
  status?: string;
  createdAt: string;
}

export interface CartItem {
  id: string; // unique cart item id
  cartItemId?: string; // server cart item ID
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  product: {
    name: string;
    images: ProductImage[];
  };
  variant: {
    size: string;
    color: string;
  };
  quantity: number;
  price: number;
}

export interface WishlistItem {
  productId: string;
  userId: string;
  product: Product;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  address?: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  createdAt: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Review {
  id: string;
  user?: {
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationData;
  errors?: unknown[];
}
