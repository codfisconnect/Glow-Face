import { apiRequest } from "../api/api";
import { DashboardMetrics, AdminNotification } from "../../types";

export const adminService = {
  async getDashboardMetrics(range: string = "30d"): Promise<DashboardMetrics> {
    const res = await apiRequest<{ ok: boolean; metrics: DashboardMetrics }>(`/admin/metrics?range=${range}`);
    return res.metrics;
  },

  async getInventory(): Promise<{ summary: any; items: any[] }> {
    return await apiRequest("/admin/inventory");
  },

  async updateStock(productId: string, stock: number, lowStockThreshold?: number) {
    return await apiRequest(`/admin/inventory/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ stock, lowStockThreshold })
    });
  },

  async getNotifications(): Promise<AdminNotification[]> {
    const res = await apiRequest<{ ok: boolean; notifications: AdminNotification[] }>("/admin/notifications");
    return res.notifications || [];
  },

  async markNotificationRead(id: string) {
    return await apiRequest(`/admin/notifications/${id}/read`, { method: "PATCH" });
  },

  async getActivities(): Promise<any[]> {
    const res = await apiRequest<{ ok: boolean; activities: any[] }>("/admin/activities");
    return res.activities || [];
  },

  async getCustomers(): Promise<any[]> {
    const res = await apiRequest<{ ok: boolean; customers: any[] }>("/admin/customers");
    return res.customers || [];
  },

  async getSettings(): Promise<Record<string, any>> {
    const res = await apiRequest<{ ok: boolean; settings: Record<string, any> }>("/admin/settings");
    return res.settings || {};
  },

  async updateSetting(key: string, value: any) {
    return await apiRequest("/admin/settings", {
      method: "POST",
      body: JSON.stringify({ key, value })
    });
  }
};
