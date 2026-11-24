import { getDb } from "@/lib/db/client";
import {
  claimShiprocketSync,
  getOrderConfirmationDetails,
  recordShiprocketFailure,
  recordShiprocketSuccess,
} from "@/lib/db/orders";
import { isShiprocketConfigured } from "@/lib/env";
import { getRazorpay } from "@/lib/razorpay/server";
import { createShiprocketOrder } from "@/lib/shiprocket/client";

/** Reduces "+91 98765-43210" style numbers to the 10-digit mobile Shiprocket expects. */
function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
}

export type ShiprocketSyncResult =
  | { status: "created"; shiprocketOrderId?: number; shipmentId?: number }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

/**
 * Pushes a paid order to Shiprocket. Idempotent: the order is claimed in the
 * database first, so concurrent or repeated calls never create a duplicate
 * shipment. Never throws: a shipping hiccup must not undo a successful payment.
 * Failures are stored on the order so they can be retried from the admin.
 */
export async function syncOrderToShiprocket(orderId: string, razorpayPaymentId: string): Promise<ShiprocketSyncResult> {
  if (!isShiprocketConfigured()) return { status: "skipped", reason: "Shiprocket is not configured" };

  let claimed = false;
  try {
    claimed = await claimShiprocketSync(orderId);
    if (!claimed) return { status: "skipped", reason: "Already synced, in progress, or order not paid" };

    const order = await getOrderConfirmationDetails(orderId);
    if (!order) throw new Error("Order not found");
    if (!/^\d{6}$/.test(order.address.postalCode.trim())) throw new Error("Invalid 6-digit pincode on order");

    const payment = await getRazorpay().payments.fetch(razorpayPaymentId);
    const phone = normalizePhone(payment.contact);
    if (!phone) throw new Error("No valid phone number on the Razorpay payment");

    const itemRows = await getDb().execute({
      sql: `SELECT name, variant, product_slug, unit_price_paise, quantity FROM order_items WHERE order_id = ?`,
      args: [orderId],
    });

    const result = await createShiprocketOrder({
      orderId,
      orderDate: new Date(order.createdAt),
      customerName: order.address.firstName,
      customerLastName: order.address.lastName,
      email: order.email,
      phone,
      addressLine1: order.address.addressLine1,
      addressLine2: order.address.addressLine2,
      city: order.address.city,
      state: order.address.state,
      postalCode: order.address.postalCode.trim(),
      country: order.address.country,
      items: itemRows.rows.map((row) => ({
        name: `${String(row.name)} (${String(row.variant)})`,
        sku: `${String(row.product_slug)}-${String(row.variant)}`,
        units: Number(row.quantity),
        sellingPrice: Number(row.unit_price_paise) / 100,
      })),
      subTotal: order.subtotalPaise / 100,
      shippingCharges: order.shippingPaise / 100,
      totalDiscount: order.discountPaise / 100,
    });

    await recordShiprocketSuccess(orderId, result.order_id, result.shipment_id);
    return { status: "created", shiprocketOrderId: result.order_id, shipmentId: result.shipment_id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shiprocket sync failed";
    if (claimed) await recordShiprocketFailure(orderId, message).catch(() => undefined);
    return { status: "failed", error: message };
  }
}
