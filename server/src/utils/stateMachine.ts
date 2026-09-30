import { OrderStatus } from "../types/index.js";
import { HttpError } from "../middleware/errorHandler.js";

/**
 * Strict Order State Machine Transition Matrix
 */
const VALID_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAID: ["PROCESSING", "PACKED", "SHIPPED", "CANCELLED", "REFUND_INITIATED"],
  PROCESSING: ["PACKED", "SHIPPED", "CANCELLED", "REFUND_INITIATED"],
  PACKED: ["SHIPPED", "CANCELLED", "REFUND_INITIATED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUND_INITIATED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "SHIPPED", "CANCELLED"],
  DELIVERED: ["REFUND_INITIATED"],
  CANCELLED: [], // Terminal state
  PAYMENT_FAILED: ["PENDING_PAYMENT", "CANCELLED"],
  REFUND_INITIATED: ["REFUNDED", "PAID"],
  REFUNDED: [] // Terminal state
};

export function isValidOrderTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true; // Idempotent no-op
  const allowed = VALID_TRANSITIONS[current];
  return allowed ? allowed.includes(next) : false;
}

export function assertValidOrderTransition(current: OrderStatus, next: OrderStatus): void {
  if (current === next) return;
  if (!isValidOrderTransition(current, next)) {
    throw new HttpError(
      400,
      `Invalid order state transition from '${current}' to '${next}'. Allowed next states: ${(VALID_TRANSITIONS[current] || []).join(", ") || "None (Terminal state)"}`
    );
  }
}
