export type Role = "CUSTOMER" | "ADMIN";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "PAYMENT_FAILED"
  | "REFUND_INITIATED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type DiscountType = "PERCENTAGE" | "FIXED";

export type NotificationChannel = "EMAIL" | "WHATSAPP" | "ADMIN";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "SIMULATED";

export type InstagramFeedSource = "LIVE_INSTAGRAM" | "FALLBACK_CONTENT";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  passwordHash?: string | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  name: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pin: string;
  email?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyIngredient {
  name: string;
  benefit: string;
}

export interface ProductImage {
  id?: string;
  productId?: string;
  url: string;
  publicId?: string | null;
  altText?: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortName?: string | null;
  sku?: string | null;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  stock: number;
  lowStockThreshold: number;
  categorySlug: string;
  category?: Category;
  description: string;
  shortDescription?: string | null;
  benefits?: string[];
  keyIngredients?: KeyIngredient[];
  ingredients: string;
  howToUse: string;
  whoItsFor?: string | null;
  skinConcerns?: string | null;
  rating: number;
  reviewsCount: number;
  featured: boolean;
  bestSeller: boolean;
  active: boolean;
  sortOrder: number;
  image: string;
  gallery?: string[];
  images?: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  productSlug?: string | null;
  productImage?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address | string;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
  notes?: string | null;
  paidAt?: Date | null;
  packedAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  refundedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  usageLimit?: number | null;
  usedCount: number;
  perCustomerLimit: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationLogRecord {
  id: string;
  orderId?: string | null;
  idempotencyKey?: string | null;
  recipient: string;
  channel: NotificationChannel;
  eventType: string;
  status: NotificationStatus;
  attempts: number;
  error?: string | null;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: Date;
}

export interface AdminActivity {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
}

export interface InstagramPost {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  permalink: string;
  caption?: string;
  timestamp?: string;
}

export interface InstagramFeed {
  source: InstagramFeedSource;
  handle?: string;
  profileUrl?: string;
  showOnHome: boolean;
  posts: InstagramPost[];
}

export interface DashboardMetrics {
  revenue: {
    totalRevenue: number;
    todayRevenue: number;
    averageOrderValue: number;
  };
  orders: {
    totalOrders: number;
    todayOrders: number;
    statusCounts: Record<string, number>;
  };
  inventory: {
    totalProducts: number;
    inStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  customers: {
    totalCustomers: number;
  };
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
  }>;
}
