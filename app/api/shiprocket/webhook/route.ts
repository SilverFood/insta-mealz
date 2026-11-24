import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { updateShiprocketTracking } from "@/lib/db/orders";

export const runtime = "nodejs";

function tokensMatch(received: string | null, expected: string): boolean {
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Shiprocket tracking webhook. Configure the same secret in Shiprocket
 * (Settings > API > Webhooks, "x-api-key" header) and in SHIPROCKET_WEBHOOK_TOKEN.
 */
export async function POST(request: Request) {
  const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN?.trim();
  if (!expected) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (!tokensMatch(request.headers.get("x-api-key"), expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const str = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim().slice(0, 100) : undefined);

    const orderId = str(body.order_id);
    if (!orderId) return NextResponse.json({ ok: true });

    await updateShiprocketTracking(orderId, {
      status: str(body.current_status),
      awb: str(body.awb),
      courier: str(body.courier_name),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[shiprocket-webhook]", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
