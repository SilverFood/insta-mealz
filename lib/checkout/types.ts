export type CheckoutItemInput = {
  slug: string;
  /** Package size id (e.g. 250gm). Sent as `variant` from the cart. */
  variant: string;
  packageSize?: string;
  quantity: number;
};

export type DeliveryAddressInput = {
  country: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export const MAX_ORDER_NOTE_LENGTH = 500;

export function normalizeOrderNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MAX_ORDER_NOTE_LENGTH);
  return trimmed.length > 0 ? trimmed : null;
}

export function parseMarketingOptIn(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "on" || normalized === "yes";
  }
  return false;
}

export type CreateCheckoutBody = {
  email: string;
  discountCode?: string;
  items: CheckoutItemInput[];
  address: DeliveryAddressInput;
  note?: string;
  marketingOptIn?: boolean;
};

export type CreateCheckoutResponse = {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  environment: "sbx" | "prod";
};

export type VerifyCheckoutBody = {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type ResolvedOrderLine = {
  productSlug: string;
  name: string;
  variant: string;
  imageUrl: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
};
