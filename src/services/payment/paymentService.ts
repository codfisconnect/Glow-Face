import { apiRequest } from "../api/api";
import { Order } from "../../types";

export const paymentService = {
  async verifyPayment(payload: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ verified: boolean; order: Order }> {
    return await apiRequest("/orders/verify", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async validateCoupon(code: string, cartTotal: number): Promise<{
    valid: boolean;
    code: string;
    discount: number;
    description?: string;
    message?: string;
  }> {
    return await apiRequest("/payment/validate-coupon", {
      method: "POST",
      body: JSON.stringify({ code, cartTotal })
    });
  }
};
