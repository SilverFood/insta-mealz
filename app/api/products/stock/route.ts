import { NextResponse } from "next/server";
import { listProductsWithLiveStock } from "@/lib/db/product-stock";
import { getStoreSettings } from "@/lib/db/store-settings";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [products, settings] = await Promise.all([listProductsWithLiveStock(), getStoreSettings()]);
    return NextResponse.json(
      { products, acceptingOrders: settings.acceptingOrders },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("public product stock list failed", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
