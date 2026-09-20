export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "ADMIN";
  avatar?: string;
  status: "ACTIVE" | "BANNED";
  tags?: string[];
  adminNotes?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId?: string | null;
  position?: number;
  status?: "ACTIVE" | "HIDDEN";
  children?: Category[];
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  publicId: string;
  isMain: boolean;
  variantColor?: string | null;
}

export interface Variant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  sku?: string;
  updatedAt?: string;
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
  features?: { icon: string; title: string; description: string }[];
  details?: { title: string; content: string }[];
  isRentable?: boolean;
  rentalPrice?: number | null;
  securityDeposit?: number | null;
  maxRentalDays?: number | null;
  rentalPeriods?: RentalPeriod[];
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
  label?: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export type OrderStatus =
  "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";

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
  carrier?: string;
  internalNotes?: string | null;
  createdAt: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Review {
  id: string;
  userId: string;
  user?: {
    id?: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: { url: string }[];
  };
  productId?: string;
  rating: number;
  title?: string;
  body: string;
  status: ReviewStatus;
  adminReply?: string | null;
  createdAt: string;
}

export interface UserMeasurements {
  id?: string;
  userId?: string;
  heightCm?: number | string | null;
  weightKg?: number | string | null;
  chestCm?: number | string | null;
  waistCm?: number | string | null;
  hipsCm?: number | string | null;
  shoeEU?: number | string | null;
  fitPreference?: string | null;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationData;
  errors?: unknown[];
}

export interface CustomerOrder {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  status: "ACTIVE" | "BANNED";
  tags?: string[];
  adminNotes?: string | null;
  orders?: CustomerOrder[];
}

export interface Customer360Profile extends Omit<AdminCustomer, "orders"> {
  addresses?: Address[];
  orders?: (CustomerOrder | Order)[];
  reviews?: Review[];
  rentals?: Rental[];
  measurements?: UserMeasurements | null;
}

export interface HeroContent {
  tagline: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  imageUrl: string;
  stats: Array<{ value: string; label: string }>;
}

export interface BrandStoryContent {
  title: string;
  heading: string;
  quote: string;
  author: string;
  authorRole: string;
  badgeText: string;
  badgeSubtext: string;
  imageUrl: string;
}

export interface CtaBannerContent {
  tagline: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export interface SocialLinksContent {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  tiktok?: string;
  pinterest?: string;
}

export interface NavLinkItem {
  name: string;
  href: string;
}

export interface FooterContent {
  brandDescription: string;
  copyrightText: string;
  socialLinks?: SocialLinksContent;
}

export interface ContactSalon {
  city: string;
  address: string;
  hours: string;
}

export interface ContactPageContent {
  email: string;
  phone: string;
  hours: string;
  salons: ContactSalon[];
}

export interface AboutPillar {
  num: string;
  title: string;
  description: string;
}

export interface AboutMilestone {
  value: string;
  label: string;
}

export interface AboutPageContent {
  badge: string;
  title: string;
  description: string;
  bannerImage: string;
  quote: string;
  quoteAuthor: string;
  pillars: AboutPillar[];
  milestones: AboutMilestone[];
}

export interface FAQItemData {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface PolicySectionData {
  id: string;
  title: string;
  content: string;
}

export interface PolicyPageContent {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: PolicySectionData[];
}

export type ContactMessageStatus = "UNREAD" | "READ" | "ARCHIVED" | "REPLIED";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: ContactMessageStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContentItem {
  id: string;
  key: string;
  data: unknown;
  updatedAt: string;
  createdAt: string;
}

export interface PwaModalBenefit {
  num: string;
  title: string;
  description: string;
}

export interface PwaModalContent {
  badge: string;
  title: string;
  imageUrl: string;
  description: string;
  benefits: PwaModalBenefit[];
  buttonText: string;
}

export interface HomeCategoriesSectionContent {
  label: string;
  heading: string;
}

export interface HomeFeaturedSectionContent {
  label: string;
  heading: string;
  viewAllText: string;
}

export interface SizeGuideRow {
  size: string;
  chest: string;
  waist: string;
  hip: string;
}

export interface MeasureInstruction {
  label: string;
  instruction: string;
}

export interface SizeGuideContent {
  title: string;
  subtitle: string;
  rows: SizeGuideRow[];
  howToMeasure: MeasureInstruction[];
  fitsAndStyles: string;
}

export interface RegionOption {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  flag: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}

export interface RegionSettingsContent {
  regions: RegionOption[];
  languages: LanguageOption[];
}

export type NewsletterStatus = "SUBSCRIBED" | "UNSUBSCRIBED";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: NewsletterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
}

export interface NewsletterListResponse {
  subscribers: NewsletterSubscriber[];
  stats: NewsletterStats;
}

export interface AnnouncementBarContent {
  enabled: boolean;
  text: string;
  badgeText?: string;
  link?: string;
  linkText?: string;
  bgColor?: string;
  textColor?: string;
  closable?: boolean;
}

// ─── RENTAL TYPES ───

export interface RentalPeriod {
  id: string;
  productId: string;
  label: string;
  days: number;
  price: number;
  isActive: boolean;
}

export type RentalStatus =
  | "RESERVED"
  | "ACTIVE"
  | "RETURN_PENDING"
  | "RETURNED"
  | "OVERDUE"
  | "CANCELLED";

export type RentalFulfillment = "DELIVERY" | "STORE_PICKUP";

export interface Rental {
  id: string;
  userId: string;
  variantId: string;
  productId: string;
  rentalPeriodId?: string | null;
  startDate: string;
  endDate: string;
  actualReturnDate?: string | null;
  fulfillment: RentalFulfillment;
  pickupLocation?: string | null;
  addressId?: string | null;
  rentalPrice: number;
  securityDeposit: number;
  depositReturned: boolean;
  lateFee: number;
  stripePaymentId?: string | null;
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  status: RentalStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  variant?: Variant;
  rentalPeriod?: RentalPeriod | null;
  address?: Address | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface RentalAvailabilityResponse {
  isRentable: boolean;
  available: boolean;
  reason?: string;
  totalStock?: number;
  activeBookingsInRange?: number;
  rentalPeriods?: RentalPeriod[];
  dailyPrice?: number | null;
  securityDeposit?: number;
}

// ─── NOTIFICATION TYPES ───

export interface Notification {
  id: string;
  userId?: string | null;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

// ─── RETURN TYPES ───

export type ReturnStatus =
  "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" | "RECEIVED";

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  description?: string | null;
  images?: string[];
  status: ReturnStatus;
  adminNotes?: string | null;
  refundAmount?: number | null;
  stripeRefundId?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// ─── SHIPPING ZONES & STORE SETTINGS ───

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  cities?: string[] | null;
  standardRate: number;
  expressRate?: number | null;
  freeAbove?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSalon {
  name: string;
  address: string;
}

export interface StoreSettingsMap {
  lowStockThreshold: number;
  abandonedCartEmailDelay: number;
  abandonedCartDiscountPercent: number;
  enableSecurityDeposit: boolean;
  defaultLateFeePerDay: number;
  maxRentalExtensionDays: number;
  enableAbandonedCartRecovery: boolean;
  storeSalons: StoreSalon[];
  [key: string]: unknown;
}

// ─── AUDIT LOGS & BANNERS ───

export interface AuditLog {
  id: string;
  userId?: string | null;
  userName?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  badge?: string | null;
  position: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}
