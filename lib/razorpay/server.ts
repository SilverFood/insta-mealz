import Razorpay from "razorpay";
import { getRazorpayConfig } from "@/lib/env";

let instance: Razorpay | null = null;
let instanceEnvKey: string | null = null;

export function getRazorpay(): Razorpay {
  const { keyId, keySecret } = getRazorpayConfig();
  const cacheKey = `${keyId}:${keySecret}`;

  if (instance && instanceEnvKey === cacheKey) return instance;

  instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  instanceEnvKey = cacheKey;
  return instance;
}

export function getRazorpayKeyId() {
  return getRazorpayConfig().keyId;
}
