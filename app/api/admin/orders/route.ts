import { NextResponse } from "next/server";
import { hasAdminSessionFromRequest } from "@/lib/admin/auth";
import { listAdminOrders } from "@/lib/db/orders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!hasAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await listAdminOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("admin orders list failed", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
