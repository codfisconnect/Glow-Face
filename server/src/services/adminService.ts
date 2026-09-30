import { getDatabase } from "../config/database.js";
import { inventoryService } from "./inventoryService.js";
import { DashboardMetrics } from "../types/index.js";

export class AdminService {
  async getDashboardMetrics(dateRange = "30d"): Promise<DashboardMetrics> {
    const { type, db } = getDatabase();

    const now = new Date();
    let startDate = new Date();
    if (dateRange === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === "yesterday") {
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === "7d") {
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === "30d") {
      startDate.setDate(now.getDate() - 30);
    } else {
      startDate = new Date(0); // All time
    }

    let allOrders: any[] = [];
    let usersCount = 0;

    if (type === "prisma") {
      allOrders = await db.order.findMany({
        where: { createdAt: { gte: startDate } },
        include: { items: true },
        orderBy: { createdAt: "desc" }
      });
      usersCount = await db.user.count({ where: { role: "CUSTOMER" } });
    } else {
      allOrders = Array.from(db.orders.values())
        .filter(o => new Date(o.createdAt) >= startDate)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      usersCount = Array.from(db.users.values()).filter(u => u.role === "CUSTOMER").length;
    }

    // Revenue calculations
    const paidOrders = allOrders.filter(o => o.paymentStatus === "PAID");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // Today specific calculations
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayPaidOrders = paidOrders.filter(o => new Date(o.createdAt) >= todayStart);
    const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Status counts
    const statusCounts: Record<string, number> = {
      PENDING_PAYMENT: 0,
      PAID: 0,
      PROCESSING: 0,
      PACKED: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      PAYMENT_FAILED: 0,
      REFUND_INITIATED: 0,
      REFUNDED: 0
    };

    allOrders.forEach(o => {
      const st = o.orderStatus || "PENDING_PAYMENT";
      if (statusCounts[st] !== undefined) statusCounts[st]++;
      else statusCounts[st] = 1;
    });

    // Inventory metrics
    const inventory = await inventoryService.getInventoryStatus();

    // Top selling products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    paidOrders.forEach(o => {
      (o.items || []).forEach((it: any) => {
        const name = it.productName || "Skincare Product";
        if (!productSales[name]) productSales[name] = { name, quantity: 0, revenue: 0 };
        const entry = productSales[name]!;
        entry.quantity += (it.quantity || 1);
        entry.revenue += (it.subtotal || 0);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      revenue: {
        totalRevenue,
        todayRevenue,
        averageOrderValue
      },
      orders: {
        totalOrders: allOrders.length,
        todayOrders: todayPaidOrders.length,
        statusCounts
      },
      inventory: inventory.summary,
      customers: {
        totalCustomers: usersCount
      },
      topProducts,
      recentOrders: allOrders.slice(0, 5).map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        totalAmount: o.totalAmount,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt
      }))
    };
  }

  async getNotifications() {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      return await db.adminNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 30
      });
    }
    return db.adminNotifications.slice(0, 30);
  }

  async markNotificationRead(id: string) {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      return await db.adminNotification.update({
        where: { id },
        data: { read: true }
      });
    }
    const notif = db.adminNotifications.find(n => n.id === id);
    if (notif) notif.read = true;
    return notif;
  }

  async getActivities() {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      return await db.adminActivity.findMany({
        orderBy: { createdAt: "desc" },
        take: 50
      });
    }
    return db.adminActivities.slice(0, 50);
  }

  async getCustomers() {
    const { type, db } = getDatabase();
    let customers: any[] = [];
    if (type === "prisma") {
      customers = await db.user.findMany({
        where: { role: "CUSTOMER" },
        include: { orders: true },
        orderBy: { createdAt: "desc" }
      });
    } else {
      customers = Array.from(db.users.values()).filter(u => u.role === "CUSTOMER");
    }

    return customers.map(c => {
      const orders = c.orders || [];
      const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      return {
        id: c.id,
        name: c.name || "Customer",
        email: c.email,
        phone: c.phone || "—",
        ordersCount: orders.length,
        totalSpent,
        createdAt: c.createdAt
      };
    });
  }

  async getSettings(): Promise<Record<string, any>> {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      const all = await db.setting.findMany();
      const map: Record<string, any> = {};
      all.forEach(s => {
        try { map[s.key] = JSON.parse(s.value); } catch { map[s.key] = s.value; }
      });
      return map;
    }

    const map: Record<string, any> = {};
    for (const [k, v] of db.settings.entries()) {
      try { map[k] = JSON.parse(v); } catch { map[k] = v; }
    }
    return map;
  }

  async updateSetting(key: string, value: any): Promise<any> {
    const { type, db } = getDatabase();
    const strVal = typeof value === "string" ? value : JSON.stringify(value);

    if (type === "prisma") {
      return await db.setting.upsert({
        where: { key },
        create: { key, value: strVal },
        update: { value: strVal }
      });
    }

    db.settings.set(key, strVal);
    return { key, value };
  }
}

export const adminService = new AdminService();
