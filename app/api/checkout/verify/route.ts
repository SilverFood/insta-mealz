import { NextResponse } from "next/server";
import type { VerifyCheckoutBody } from "@/lib/checkout/types";
import { getOrderById, markOrderCompleted, markOrderFailed } from "@/lib/db/orders";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import { getRazorpayConfig } from "@/lib/env";
import { verifyRazorpaySignature } from "@/lib/razorpay/verify";
import { syncOrderToShiprocket } from "@/lib/shiprocket/sync-order";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyCheckoutBody;
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const { keySecret: secret } = getRazorpayConfig();

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "completed") {
      return NextResponse.json({ ok: true, orderId });
    }

    if (order.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
    }

    const valid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      secret,
    });

    if (!valid) {
      await markOrderFailed(orderId);
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const transitioned = await markOrderCompleted(orderId, razorpay_payment_id);
    if (!transitioned) {
      // A concurrent request already completed this order and ran the side effects.
      return NextResponse.json({ ok: true, orderId });
    }

    const shipping = await syncOrderToShiprocket(orderId, razorpay_payment_id);
    if (shipping.status === "failed") {
      console.error("[shiprocket]", shipping.error, { orderId });
    }

    const emailResult = await sendOrderConfirmationEmail(orderId);
    if (emailResult.status === "failed") {
      console.error("[order-confirmation-email]", emailResult.error, { orderId: emailResult.orderId });
    }

    return NextResponse.json({ ok: true, orderId });
  } catch (error) {
    console.error("[checkout-verify]", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
