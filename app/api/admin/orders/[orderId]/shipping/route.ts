import { NextResponse } from "next/server";
import { hasAdminSessionFromRequest } from "@/lib/admin/auth";
import { getRazorpayPaymentId } from "@/lib/db/orders";
import { syncOrderToShiprocket } from "@/lib/shiprocket/sync-order";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ orderId: string }> };

/** Admin-only: retry creating the Shiprocket order for a paid order whose sync failed. */
export async function POST(request: Request, context: RouteContext) {
  if (!hasAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await context.params;
  if (!orderId?.trim()) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    const paymentId = await getRazorpayPaymentId(orderId);
    if (!paymentId) {
      return NextResponse.json({ error: "Order is not paid" }, { status: 400 });
    }
    const result = await syncOrderToShiprocket(orderId, paymentId);
    return NextResponse.json({ result }, { status: result.status === "failed" ? 502 : 200 });
  } catch (error) {
    console.error("admin shipping retry failed", error);
    return NextResponse.json({ error: "Failed to retry shipping" }, { status: 500 });
  }
}
