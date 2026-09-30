import { apiRequest } from "./api";
import { User } from "../types";

export const authService = {
  async register(data: { email: string; password: string; name: string; phone?: string }): Promise<{ user: User; token: string }> {
    return await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    return await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async getProfile(): Promise<User> {
    const res = await apiRequest<{ ok: boolean; user: User }>("/auth/profile");
    return res.user;
  }
};