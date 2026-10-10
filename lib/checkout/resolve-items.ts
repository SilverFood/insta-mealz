import { getProduct } from "@/lib/products";
import { getLiveStockBySlug } from "@/lib/db/product-stock";
import { rupeesToPaise } from "@/lib/checkout/pricing";
import type { CheckoutItemInput, ResolvedOrderLine } from "@/lib/checkout/types";
import {
  DEFAULT_PACKAGE_SIZE_ID,
  getPackageSize,
  unitPriceInr,
} from "@/lib/products/package-sizes";

export async function resolveOrderLines(items: CheckoutItemInput[]): Promise<ResolvedOrderLine[]> {
  if (!items.length) {
    throw new Error("Cart is empty");
  }

  const liveStockBySlug = await getLiveStockBySlug(items.map((item) => item.slug));
  const lines: ResolvedOrderLine[] = [];

  for (const item of items) {
    const quantity = Math.floor(item.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new Error("Invalid quantity");
    }

    const product = getProduct(item.slug);
    if (!product) {
      throw new Error(`Unknown product: ${item.slug}`);
    }

    const inStock = liveStockBySlug[product.slug] ?? product.inStock;
    if (!inStock) {
      throw new Error(`${product.name} is currently out of stock. Remove it from your cart and try again.`);
    }

    const packageSizeId = (item.variant || item.packageSize || DEFAULT_PACKAGE_SIZE_ID).trim();
    if (!getPackageSize(packageSizeId)) {
      throw new Error(`Invalid package size for ${product.name}`);
    }

    const unitPricePaise = rupeesToPaise(unitPriceInr(product.price, packageSizeId));
    lines.push({
      productSlug: product.slug,
      name: product.name,
      variant: packageSizeId,
      imageUrl: product.image,
      unitPricePaise,
      quantity,
      lineTotalPaise: unitPricePaise * quantity,
    });
  }

  return lines;
}

export function subtotalPaiseFromLines(lines: ResolvedOrderLine[]) {
  return lines.reduce((sum, line) => sum + line.lineTotalPaise, 0);
}
