import { adminService } from "../../services/admin/adminService";

export const analyticsAdmin = {
  getMetrics: (range: string = "30d") => adminService.getDashboardMetrics(range),
  getActivities: () => adminService.getActivities()
};
