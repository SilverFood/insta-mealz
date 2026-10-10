import { NextResponse } from "next/server";
import { hasAdminSessionFromRequest } from "@/lib/admin/auth";
import { getOrderConfirmationDetails } from "@/lib/db/orders";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!hasAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await context.params;
  if (!orderId?.trim()) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    const order = await getOrderConfirmationDetails(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error("admin order detail failed", error);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}
