import { isIndianStateOrUt } from "@/lib/checkout/india-states";
import type { DeliveryAddressInput } from "@/lib/checkout/types";

export type CheckoutFieldKey =
  | "email"
  | "first"
  | "last"
  | "address"
  | "city"
  | "state"
  | "pin"
  | "country"
  | "apartment";

export type CheckoutFieldErrors = Partial<Record<CheckoutFieldKey, string>>;

export type CheckoutFormInput = {
  email: string;
  country: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[\p{L}\s'.-]{1,60}$/u;
const INDIAN_PIN_PATTERN = /^[1-9][0-9]{5}$/;

function trimField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateName(value: string, label: string): string | undefined {
  if (!value) return `${label} is required.`;
  if (value.length > 60) return `${label} must be 60 characters or fewer.`;
  if (!NAME_PATTERN.test(value)) {
    return `${label} can only include letters, spaces, hyphens, apostrophes, and periods.`;
  }
  return undefined;
}

function validateIndianPin(postalCode: string): string | undefined {
  if (!postalCode) return "PIN code is required.";
  if (!/^\d+$/.test(postalCode)) return "PIN code must contain digits only.";
  if (postalCode.length !== 6) return "Enter a valid 6-digit PIN code.";
  if (!INDIAN_PIN_PATTERN.test(postalCode)) return "Enter a valid Indian PIN code.";
  return undefined;
}

export function validateCheckoutForm(
  input: CheckoutFormInput,
  options?: { requireItems?: boolean; hasItems?: boolean },
): { ok: true; data: CheckoutFormInput & { address: DeliveryAddressInput } } | { ok: false; errors: CheckoutFieldErrors; formError?: string } {
  const errors: CheckoutFieldErrors = {};

  if (options?.requireItems && !options.hasItems) {
    return { ok: false, errors, formError: "Add at least one item to your cart before checkout." };
  }

  const email = trimField(input.email);
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
  else if (email.length > 254) errors.email = "Email must be 254 characters or fewer.";

  const country = trimField(input.country) || "India";
  if (country !== "India") {
    errors.country = "Delivery is currently available in India only.";
  }

  const firstName = trimField(input.firstName);
  const lastName = trimField(input.lastName);
  const firstErr = validateName(firstName, "First name");
  const lastErr = validateName(lastName, "Last name");
  if (firstErr) errors.first = firstErr;
  if (lastErr) errors.last = lastErr;

  const addressLine1 = trimField(input.addressLine1);
  if (!addressLine1) errors.address = "Street address is required.";
  else if (addressLine1.length < 5) errors.address = "Enter a complete street address (at least 5 characters).";
  else if (addressLine1.length > 200) errors.address = "Street address must be 200 characters or fewer.";

  const city = trimField(input.city);
  if (!city) errors.city = "City is required.";
  else if (city.length < 2) errors.city = "Enter a valid city name.";
  else if (city.length > 80) errors.city = "City must be 80 characters or fewer.";

  const state = trimField(input.state);
  if (!state) errors.state = "Select a state or union territory.";
  else if (!isIndianStateOrUt(state)) errors.state = "Select a valid state or union territory.";

  const postalCode = trimField(input.postalCode);
  const pinErr = country === "India" ? validateIndianPin(postalCode) : undefined;
  if (pinErr) errors.pin = pinErr;

  const addressLine2 = trimField(input.addressLine2 ?? "");
  if (addressLine2.length > 200) {
    errors.apartment = "Apartment or suite must be 200 characters or fewer.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      email,
      country,
      firstName,
      lastName,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      state,
      postalCode,
      address: {
        country,
        firstName,
        lastName,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city,
        state,
        postalCode,
      },
    },
  };
}

/** Server-side parse from API JSON body. */
export function validateCheckoutBody(body: {
  email?: string;
  address?: Partial<DeliveryAddressInput>;
  items?: unknown[];
}): ReturnType<typeof validateCheckoutForm> {
  const address = body.address ?? {};
  return validateCheckoutForm(
    {
      email: body.email ?? "",
      country: address.country ?? "India",
      firstName: address.firstName ?? "",
      lastName: address.lastName ?? "",
      addressLine1: address.addressLine1 ?? "",
      addressLine2: address.addressLine2,
      city: address.city ?? "",
      state: address.state ?? "",
      postalCode: address.postalCode ?? "",
    },
    {
      requireItems: true,
      hasItems: Array.isArray(body.items) && body.items.length > 0,
    },
  );
}
