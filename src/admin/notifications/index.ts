import { adminService } from "../../services/admin/adminService";

export const notificationsAdmin = {
  getNotifications: () => adminService.getNotifications(),
  markRead: (id: string) => adminService.markNotificationRead(id)
};
