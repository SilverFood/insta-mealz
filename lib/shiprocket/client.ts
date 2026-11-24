import { getShiprocketConfig } from "@/lib/env";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";
/** Shiprocket tokens last 10 days; refresh a day early. */
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000;

const REQUEST_TIMEOUT_MS = 10_000;

let cachedToken: { value: string; expiresAt: number } | null = null;
let loginInFlight: Promise<string> | null = null;

/** Keeps upstream error text short so echoed addresses and other PII don't flood logs. */
function truncate(text: string, max = 300) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

async function getToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  // Share one login between concurrent callers instead of hammering the auth endpoint.
  loginInFlight ??= login().finally(() => {
    loginInFlight = null;
  });
  return loginInFlight;
}

async function login(): Promise<string> {
  const { email, password } = getShiprocketConfig();
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const data = (await response.json().catch(() => ({}))) as { token?: string; message?: string };
  if (!response.ok || !data.token) {
    throw new Error(`Shiprocket login failed (${response.status}): ${data.message ?? "no token returned"}`);
  }
  cachedToken = { value: data.token, expiresAt: Date.now() + TOKEN_TTL_MS };
  return data.token;
}

async function shiprocketPost<T>(path: string, body: unknown): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = await getToken(attempt > 0);
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (response.status === 401 && attempt === 0) continue;
    const data = (await response.json().catch(() => ({}))) as T & { message?: string; errors?: unknown };
    if (!response.ok) {
      throw new Error(
        truncate(
          `Shiprocket ${path} failed (${response.status}): ${data.message ?? ""} ${JSON.stringify(data.errors ?? "")}`.trim(),
        ),
      );
    }
    return data;
  }
  throw new Error(`Shiprocket ${path} failed: unauthorized`);
}

export type ShiprocketOrderInput = {
  orderId: string;
  orderDate: Date;
  customerName: string;
  customerLastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  items: { name: string; sku: string; units: number; sellingPrice: number }[];
  subTotal: number;
  shippingCharges: number;
  totalDiscount: number;
};

export type ShiprocketOrderResult = {
  order_id?: number;
  shipment_id?: number;
  status?: string;
};

function formatOrderDate(date: Date) {
  // Shiprocket expects "YYYY-MM-DD HH:mm" in IST.
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 16).replace("T", " ");
}

/** Creates a prepaid order in Shiprocket (does not assign a courier or schedule pickup). */
export async function createShiprocketOrder(input: ShiprocketOrderInput): Promise<ShiprocketOrderResult> {
  const config = getShiprocketConfig();
  const units = input.items.reduce((sum, item) => sum + item.units, 0);

  return shiprocketPost<ShiprocketOrderResult>("/orders/create/adhoc", {
    order_id: input.orderId,
    order_date: formatOrderDate(input.orderDate),
    pickup_location: config.pickupLocation,
    billing_customer_name: input.customerName,
    billing_last_name: input.customerLastName,
    billing_address: input.addressLine1,
    billing_address_2: input.addressLine2 ?? "",
    billing_city: input.city,
    billing_pincode: input.postalCode,
    billing_state: input.state,
    billing_country: input.country || "India",
    billing_email: input.email,
    billing_phone: input.phone,
    shipping_is_billing: true,
    order_items: input.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      units: item.units,
      selling_price: item.sellingPrice,
    })),
    payment_method: "Prepaid",
    shipping_charges: input.shippingCharges,
    total_discount: input.totalDiscount,
    sub_total: input.subTotal,
    length: config.lengthCm,
    breadth: config.breadthCm,
    height: Number((config.unitHeightCm * Math.max(1, units)).toFixed(1)),
    weight: Math.max(0.25,Number((units * config.itemWeightKg).toFixed(2))),
  });
}
