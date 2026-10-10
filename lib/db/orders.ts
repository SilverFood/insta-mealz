import { getDb } from "@/lib/db/client";
import type { DeliveryAddressInput, ResolvedOrderLine } from "@/lib/checkout/types";
import { totalDiscountPaise, type CheckoutTotals } from "@/lib/checkout/pricing";

export type OrderRecord = {
  id: string;
  status: string;
  total_paise: number;
  razorpay_order_id: string | null;
};

export type AdminOrderSummary = {
  id: string;
  email: string;
  status: string;
  totalPaise: number;
  itemCount: number;
  createdAt: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  customerNote: string | null;
  marketingOptIn: boolean;
};

function rowMarketingOptIn(value: unknown): boolean {
  return value === 1 || value === true || value === "1";
}

export async function listAdminOrders(): Promise<AdminOrderSummary[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, email, status, total_paise, item_count, created_at,
                 razorpay_order_id, razorpay_payment_id, customer_note, marketing_opt_in
          FROM orders
          ORDER BY created_at DESC`,
  });

  return result.rows.map((row) => ({
    id: String(row.id),
    email: String(row.email),
    status: String(row.status),
    totalPaise: Number(row.total_paise),
    itemCount: Number(row.item_count),
    createdAt: String(row.created_at),
    razorpayOrderId: row.razorpay_order_id != null ? String(row.razorpay_order_id) : null,
    razorpayPaymentId: row.razorpay_payment_id != null ? String(row.razorpay_payment_id) : null,
    customerNote: row.customer_note != null && String(row.customer_note).trim() ? String(row.customer_note) : null,
    marketingOptIn: rowMarketingOptIn(row.marketing_opt_in),
  }));
}

export async function createPendingOrder(params: {
  orderId: string;
  email: string;
  totals: CheckoutTotals;
  itemCount: number;
  lines: ResolvedOrderLine[];
  address: DeliveryAddressInput;
  note: string | null;
  marketingOptIn: boolean;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const { orderId, email, totals, itemCount, lines, address, note, marketingOptIn } = params;

  const statements = [
    {
      sql: `INSERT INTO orders (
        id, email, status, currency, subtotal_paise, discount_code, discount_paise,
        shipping_paise, total_paise, item_count, customer_note, marketing_opt_in, created_at, updated_at
      ) VALUES (?, ?, 'pending', 'INR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        orderId,
        email,
        totals.subtotalPaise,
        totals.discountCode,
        totalDiscountPaise(totals),
        totals.shippingPaise,
        totals.totalPaise,
        itemCount,
        note,
        marketingOptIn ? 1 : 0,
        now,
        now,
      ],
    },
    {
      sql: `INSERT INTO order_delivery_addresses (
        order_id, country, first_name, last_name, address_line1, address_line2, city, state, postal_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        orderId,
        address.country,
        address.firstName,
        address.lastName,
        address.addressLine1,
        address.addressLine2 ?? null,
        address.city,
        address.state,
        address.postalCode,
      ],
    },
    ...lines.map((line) => ({
      sql: `INSERT INTO order_items (
        id, order_id, product_slug, name, variant, image_url,
        unit_price_paise, quantity, line_total_paise
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(),
        orderId,
        line.productSlug,
        line.name,
        line.variant,
        line.imageUrl,
        line.unitPricePaise,
        line.quantity,
        line.lineTotalPaise,
      ],
    })),
  ];

  await db.batch(statements, "write");
}

export async function setRazorpayOrderId(orderId: string, razorpayOrderId: string) {
  const db = getDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `UPDATE orders SET razorpay_order_id = ?, updated_at = ? WHERE id = ?`,
    args: [razorpayOrderId, now, orderId],
  });
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, status, total_paise, razorpay_order_id FROM orders WHERE id = ?`,
    args: [orderId],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: String(row.id),
    status: String(row.status),
    total_paise: Number(row.total_paise),
    razorpay_order_id: row.razorpay_order_id != null ? String(row.razorpay_order_id) : null,
  };
}

export async function markOrderCompleted(orderId: string, razorpayPaymentId: string) {
  const db = getDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `UPDATE orders SET status = 'completed', razorpay_payment_id = ?, updated_at = ? WHERE id = ?`,
    args: [razorpayPaymentId, now, orderId],
  });
}

export async function markOrderFailed(orderId: string) {
  const db = getDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `UPDATE orders SET status = 'failed', updated_at = ? WHERE id = ? AND status = 'pending'`,
    args: [now, orderId],
  });
}

export type OrderConfirmationItem = {
  name: string;
  variant: string;
  imageUrl: string | null;
  quantity: number;
  lineTotalPaise: number;
};

export type OrderConfirmationDetails = {
  id: string;
  email: string;
  subtotalPaise: number;
  discountCode: string | null;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  customerNote: string | null;
  marketingOptIn: boolean;
  createdAt: string;
  address: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderConfirmationItem[];
};

export async function getOrderConfirmationDetails(orderId: string): Promise<OrderConfirmationDetails | null> {
  const db = getDb();
  const orderResult = await db.execute({
    sql: `SELECT id, email, subtotal_paise, discount_code, discount_paise, shipping_paise, total_paise, customer_note, marketing_opt_in, created_at
          FROM orders WHERE id = ?`,
    args: [orderId],
  });
  if (orderResult.rows.length === 0) return null;

  const orderRow = orderResult.rows[0];
  const addressResult = await db.execute({
    sql: `SELECT country, first_name, last_name, address_line1, address_line2, city, state, postal_code
          FROM order_delivery_addresses WHERE order_id = ?`,
    args: [orderId],
  });
  if (addressResult.rows.length === 0) return null;

  const addressRow = addressResult.rows[0];
  const itemsResult = await db.execute({
    sql: `SELECT name, variant, image_url, quantity, line_total_paise FROM order_items WHERE order_id = ? ORDER BY name ASC`,
    args: [orderId],
  });

  return {
    id: String(orderRow.id),
    email: String(orderRow.email),
    subtotalPaise: Number(orderRow.subtotal_paise),
    discountCode: orderRow.discount_code != null ? String(orderRow.discount_code) : null,
    discountPaise: Number(orderRow.discount_paise),
    shippingPaise: Number(orderRow.shipping_paise),
    totalPaise: Number(orderRow.total_paise),
    customerNote:
      orderRow.customer_note != null && String(orderRow.customer_note).trim()
        ? String(orderRow.customer_note)
        : null,
    marketingOptIn: rowMarketingOptIn(orderRow.marketing_opt_in),
    createdAt: String(orderRow.created_at),
    address: {
      firstName: String(addressRow.first_name),
      lastName: String(addressRow.last_name),
      addressLine1: String(addressRow.address_line1),
      addressLine2: addressRow.address_line2 != null ? String(addressRow.address_line2) : null,
      city: String(addressRow.city),
      state: String(addressRow.state),
      postalCode: String(addressRow.postal_code),
      country: String(addressRow.country),
    },
    items: itemsResult.rows.map((row) => ({
      name: String(row.name),
      variant: String(row.variant),
      imageUrl: row.image_url != null ? String(row.image_url) : null,
      quantity: Number(row.quantity),
      lineTotalPaise: Number(row.line_total_paise),
    })),
  };
}
