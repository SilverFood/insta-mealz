import { NextResponse } from "next/server";
import { listProductsWithLiveStock } from "@/lib/db/product-stock";

export const runtime = "nodejs";

export async function GET() {
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
    console.error("public product stock list failed", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
