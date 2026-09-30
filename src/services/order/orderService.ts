import { apiRequest } from "../api/api";
import { Order, OrderStatus } from "../../types";

export const orderService = {
  async createOrder(payload: {
    items: Array<{ productId: string; quantity: number }>;
    coupon?: string | null;
    customer: { name: string; email: string; phone: string };
    shippingAddress: any;
  }): Promise<{
    orderId: string;
    orderNumber: string;
    razorpayOrderId: string;
    amountPaise: number;
    currency: string;
    totalAmount: number;
  }> {
    return await apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async getCustomerOrders(email?: string): Promise<Order[]> {
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    const res = await apiRequest<{ ok: boolean; orders: Order[] }>(`/orders/my-orders${qs}`);
    return res.orders || [];
  },

  async getOrder(id: string): Promise<Order> {
    const res = await apiRequest<{ ok: boolean; order: Order }>(`/orders/track/${id}`);
    return res.order;
  },

  async getAdminOrders(params: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.paymentStatus) query.set("paymentStatus", params.paymentStatus);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    const res = await apiRequest<{
      ok: boolean;
      orders: Order[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/orders/admin/list${qs ? `?${qs}` : ""}`);

    return res;
  },

  async getAdminOrderDetail(id: string): Promise<Order> {
    const res = await apiRequest<{ ok: boolean; order: Order }>(`/orders/admin/${id}`);
    return res.order;
  },

  async updateOrderStatus(id: string, updates: {
    orderStatus?: OrderStatus;
    carrier?: string;
    trackingNumber?: string;
    notes?: string;
  }): Promise<Order> {
    const res = await apiRequest<{ ok: boolean; order: Order }>(`/orders/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
    return res.order;
  }
};
