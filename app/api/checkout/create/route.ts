import { NextResponse } from "next/server";
import { computeCheckoutTotals } from "@/lib/checkout/pricing";
import { resolveOrderLines, subtotalPaiseFromLines } from "@/lib/checkout/resolve-items";
import { normalizeOrderNote, parseMarketingOptIn, type CreateCheckoutBody } from "@/lib/checkout/types";
import { validateCheckoutBody } from "@/lib/checkout/validate";
import { createPendingOrder, setRazorpayOrderId } from "@/lib/db/orders";
import { generateOrderId } from "@/lib/orders/generate-order-id";
import { getAppEnv } from "@/lib/env";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay/server";

export const runtime = "nodejs";

function parseBody(body: CreateCheckoutBody) {
  const validated = validateCheckoutBody(body);
  if (!validated.ok) {
    const firstError =
      validated.formError ??
      validated.errors.email ??
      validated.errors.first ??
      validated.errors.last ??
      validated.errors.address ??
      validated.errors.city ??
      validated.errors.state ??
      validated.errors.pin ??
      validated.errors.country ??
      validated.errors.apartment ??
      "Check your contact and delivery details.";
    throw new Error(firstError);
  }

  return {
    email: validated.data.email,
    discountCode: body.discountCode,
    items: body.items ?? [],
    note: normalizeOrderNote(body.note),
    marketingOptIn: parseMarketingOptIn(body.marketingOptIn),
    address: validated.data.address,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCheckoutBody;
    const parsed = parseBody(body);
    const lines = await resolveOrderLines(parsed.items);
    const subtotalPaise = subtotalPaiseFromLines(lines);
    const unitPricesPaise = lines.flatMap((line) =>
      Array.from({ length: line.quantity }, () => line.unitPricePaise),
    );
    const totals = computeCheckoutTotals(subtotalPaise, parsed.discountCode, unitPricesPaise);
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

    if (totals.totalPaise < 1) {
      return NextResponse.json({ error: "Order total must be greater than zero" }, { status: 400 });
    }

    const orderId = generateOrderId();
    await createPendingOrder({
      orderId,
      email: parsed.email,
      totals,
      itemCount,
      lines,
      address: parsed.address,
      note: parsed.note,
      marketingOptIn: parsed.marketingOptIn,
    });

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: totals.totalPaise,
      currency: "INR",
      receipt: orderId,
    });

    await setRazorpayOrderId(orderId, razorpayOrder.id);

    return NextResponse.json({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: totals.totalPaise,
      currency: "INR",
      keyId: getRazorpayKeyId(),
      environment: getAppEnv(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start checkout";
    const status =
      message.includes("required") ||
      message.includes("empty") ||
      message.includes("Invalid") ||
      message.includes("valid") ||
      message.includes("Check your") ||
      message.includes("Fix the") ||
      message.includes("Add at least") ||
      message.includes("package size") ||
      message.includes("Unknown product") ||
      message.toLowerCase().includes("out of stock")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
