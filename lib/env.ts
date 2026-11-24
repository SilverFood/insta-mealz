export type AppEnv = "sbx" | "prod";

/** Sandbox uses Razorpay test mode; production uses live keys. */
export function getAppEnv(): AppEnv {
  const raw = process.env.INSTAMEALZ_ENV?.trim().toLowerCase();
  if (raw === "prod" || raw === "production") return "prod";
  return "sbx";
}

export function isSandbox() {
  return getAppEnv() === "sbx";
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name} (INSTAMEALZ_ENV=${getAppEnv()})`);
  }
  return value;
}

export function getTursoConfig() {
  return {
    url: requireEnv("TURSO_DATABASE_URL"),
    authToken: requireEnv("TURSO_AUTH_TOKEN"),
  };
}

export function getRazorpayConfig() {
  return {
    keyId: requireEnv("RAZORPAY_KEY_ID"),
    keySecret: requireEnv("RAZORPAY_KEY_SECRET"),
  };
}

export function getResendConfig() {
  return {
    apiKey: requireEnv("RESEND_API_KEY"),
    from: requireEnv("EMAIL_FROM"),
  };
}

/** True when Resend is configured (order confirmation can be sent). */
export function isOrderEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

/** Public site origin for email assets and links (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = process.env.INSTAMEALZ_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  throw new Error(`Missing INSTAMEALZ_SITE_URL (INSTAMEALZ_ENV=${getAppEnv()})`);
}

/** Shiprocket API user credentials plus default parcel setting. */
export function getShiprocketConfig() {
  const num = (name: string, fallback: number) => {
    const parsed = Number(process.env[name]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };
  return {
    email: requireEnv("SHIPROCKET_EMAIL"),
    password: requireEnv("SHIPROCKET_PASSWORD"),
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION?.trim() || "warehouse-1",
    itemWeightKg: num("SHIPROCKET_ITEM_WEIGHT_KG", 0.25),
    // Single pouch: 210mm tall x 140mm wide, ~40mm thick (bottom gusset).
    // Multiple pouches are stacked along the thinnest side, so only height grows.
    lengthCm: num("SHIPROCKET_PACKAGE_LENGTH_CM", 21),
    breadthCm: num("SHIPROCKET_PACKAGE_BREADTH_CM", 14),
    unitHeightCm: num("SHIPROCKET_PACKAGE_HEIGHT_CM", 4),
  };
}

export function isShiprocketConfigured(): boolean {
  return Boolean(process.env.SHIPROCKET_EMAIL?.trim() && process.env.SHIPROCKET_PASSWORD?.trim());
}
