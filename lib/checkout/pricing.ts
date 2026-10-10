export const SHIPPING_FEE_PAISE = 4900;
export const FREE_SHIPPING_SUBTOTAL_PAISE = 39500;

export const FREE_SHIPPING_SUBTOTAL_INR = FREE_SHIPPING_SUBTOTAL_PAISE / 100;
export const SHIPPING_FEE_INR = SHIPPING_FEE_PAISE / 100;

export function rupeesToPaise(rupees: number) {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number) {
  return paise / 100;
}

/** Cheapest-free B2G1: one free unit per 3 items in the cart. */
export function computeBuy2Get1DiscountPaise(unitPricesPaise: number[]): number {
  if (unitPricesPaise.length < 3) return 0;
  const sorted = [...unitPricesPaise].sort((a, b) => a - b);
  const freeUnits = Math.floor(sorted.length / 3);
  return sorted.slice(0, freeUnits).reduce((sum, price) => sum + price, 0);
}

export function resolveDiscount(
  discountCode: string | null | undefined,
  subtotalAfterB2g1Paise: number,
): { discountCode: string | null; discountPaise: number } {
  const normalized = discountCode?.trim().toUpperCase() ?? "";
  if (normalized === "INSTA10") {
    return { discountCode: "INSTA10", discountPaise: Math.round(subtotalAfterB2g1Paise * 0.1) };
  }
  return { discountCode: null, discountPaise: 0 };
}

export type CheckoutTotals = {
  subtotalPaise: number;
  b2g1Paise: number;
  discountCode: string | null;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
};

export function computeCheckoutTotals(
  subtotalPaise: number,
  discountCode: string | null | undefined,
  unitPricesPaise: number[] = [],
): CheckoutTotals {
  const b2g1Paise = computeBuy2Get1DiscountPaise(unitPricesPaise);
  const subtotalAfterB2g1 = Math.max(0, subtotalPaise - b2g1Paise);
  const { discountCode: appliedCode, discountPaise } = resolveDiscount(discountCode, subtotalAfterB2g1);
  const shippingPaise =
    subtotalPaise === 0
      ? 0
      : subtotalPaise >= FREE_SHIPPING_SUBTOTAL_PAISE
        ? 0
        : SHIPPING_FEE_PAISE;
  const totalPaise = Math.max(0, subtotalAfterB2g1 - discountPaise + shippingPaise);

  return {
    subtotalPaise,
    b2g1Paise,
    discountCode: appliedCode,
    discountPaise,
    shippingPaise,
    totalPaise,
  };
}

/** Combined promotional discount stored on the order row. */
export function totalDiscountPaise(totals: CheckoutTotals) {
  return totals.b2g1Paise + totals.discountPaise;
}
