import { NextResponse } from "next/server";
import { hasAdminSessionFromRequest } from "@/lib/admin/auth";
import { getProduct } from "@/lib/products";
import { updateProductStock } from "@/lib/db/product-stock";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!hasAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const normalizedSlug = slug?.trim();
  if (!normalizedSlug) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let inStock: boolean;
  try {
    const body = (await request.json()) as { inStock?: boolean };
    if (typeof body.inStock !== "boolean") {
      return NextResponse.json({ error: "Invalid stock value" }, { status: 400 });
    }
    inStock = body.inStock;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const baseProduct = getProduct(normalizedSlug);
  if (!baseProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    await updateProductStock(normalizedSlug, inStock);
    return NextResponse.json(
      {
        product: {
          ...baseProduct,
          inStock,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("admin product stock update failed", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
