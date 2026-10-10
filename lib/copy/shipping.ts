import { formatInr } from "@/lib/money";
import { FREE_SHIPPING_SUBTOTAL_INR, SHIPPING_FEE_INR } from "@/lib/checkout/pricing";

export const FREE_SHIPPING_PROMO_LABEL = `Free shipping on orders above ${formatInr(FREE_SHIPPING_SUBTOTAL_INR, false)}`;

export function freeShippingCartMessage(remainingInr: number) {
  if (remainingInr <= 0) return "You have free shipping.";
  return `Spend ${formatInr(remainingInr)} to get free shipping`;
}

export function standardShippingCheckoutBlurb(shippingIsFree: boolean) {
  if (shippingIsFree) return "Free shipping on this order.";
  return `Standard shipping ${formatInr(SHIPPING_FEE_INR)}. Free on orders above ${formatInr(FREE_SHIPPING_SUBTOTAL_INR, false)}.`;
}

export const DISPATCH_FROM_VALSAD_NOTE =
  "Orders are packed in Valsad, Gujarat and usually ship within 2 working days.";
