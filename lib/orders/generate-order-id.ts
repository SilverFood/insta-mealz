import { randomInt } from "node:crypto";

/** Public order id shown in checkout, email, and support (not a UUID). */
export function generateOrderId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const suffix = randomInt(100000, 999999);
  return `IM${y}${m}${d}${suffix}`;
}
