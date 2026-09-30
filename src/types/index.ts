export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  sortOrder: number;
  active: boolean;
}

export interface KeyIngredient {
  name: string;
  benefit: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  altText?: string;
  sortOrder?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortName?: string;
  sku?: string;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  stock: number;
  lowStockThreshold?: number;
  categorySlug: string;
  category?: Category;
  description: string;
  shortDescription?: string;
  benefits?: string[];
  keyIngredients?: KeyIngredient[];
  ingredients?: string;
  howToUse?: string;
  whoItsFor?: string;
  skinConcerns?: string;
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
  bestSeller?: boolean;
  active?: boolean;
  sortOrder?: number;
  image: string;
  gallery?: string[];
  images?: ProductImage[];
}

export interface CartItem {
  id: string; // product id
  productId: string;
  name: string;
  shortName?: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  quantity: number;
  image: string;
  stock?: number;
  maxStock?: number;
}

export interface Address {
  name: string;
  address: string;
  apt?: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
  email: string;
}

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  productSlug?: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

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
  | "REFUNDED";

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
  orderStatus: OrderStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  trackingNumber?: string | null;
  carrier?: string | null;
  notes?: string | null;
  createdAt: string;
  paidAt?: string | null;
  packedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  refundedAt?: string | null;
  items: OrderItem[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface InstagramPost {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  permalink: string;
  caption?: string;
  timestamp?: string;
  likeCount?: number;
}

export interface InstagramFeed {
  source: string;
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
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
  }>;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}