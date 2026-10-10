import { NextResponse } from "next/server";
import { hasAdminSessionFromRequest } from "@/lib/admin/auth";
import { listProductsWithLiveStock } from "@/lib/db/product-stock";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!hasAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await listProductsWithLiveStock();
    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("admin product stock list failed", error);
    return NextResponse.json({ error: "Failed to load product stock" }, { status: 500 });
  }
}
