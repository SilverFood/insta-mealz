import { getDb } from "@/lib/db/client";
import { getProduct, products, type Product } from "@/lib/products";

export type ProductStockRecord = {
  slug: string;
  inStock: boolean;
  updatedAt: string;
};

function rowInStock(value: unknown): boolean {
  return value === 1 || value === true || value === "1";
}

function normalizeSlugs(slugs: string[]): string[] {
  const deduped = new Set<string>();
  for (const slug of slugs) {
    const normalized = slug.trim();
    if (normalized) deduped.add(normalized);
  }
  return Array.from(deduped);
}

export async function listProductStockOverrides(slugs?: string[]): Promise<ProductStockRecord[]> {
  const db = getDb();
  const normalizedSlugs = slugs ? normalizeSlugs(slugs) : [];
  const scoped = normalizedSlugs.length > 0;
  const placeholders = normalizedSlugs.map(() => "?").join(", ");

  const result = await db.execute({
    sql: scoped
      ? `SELECT slug, in_stock, updated_at
         FROM product_inventory
         WHERE slug IN (${placeholders})`
      : `SELECT slug, in_stock, updated_at
         FROM product_inventory`,
    args: scoped ? normalizedSlugs : [],
  });

  return result.rows.map((row) => ({
    slug: String(row.slug),
    inStock: rowInStock(row.in_stock),
    updatedAt: String(row.updated_at),
  }));
}

export function mergeProductsWithStockOverrides(
  baseProducts: Product[],
  overrides: ProductStockRecord[],
): Product[] {
  const overrideBySlug = new Map(overrides.map((override) => [override.slug, override.inStock]));
  return baseProducts.map((product) => {
    if (!overrideBySlug.has(product.slug)) return product;
    return { ...product, inStock: Boolean(overrideBySlug.get(product.slug)) };
  });
}

export async function listProductsWithLiveStock(): Promise<Product[]> {
  const overrides = await listProductStockOverrides(products.map((product) => product.slug));
  return mergeProductsWithStockOverrides(products, overrides);
}

export async function getLiveProductBySlug(slug: string): Promise<Product | null> {
  const base = getProduct(slug);
  if (!base) return null;

  const overrides = await listProductStockOverrides([slug]);
  if (!overrides.length) return base;
  return { ...base, inStock: overrides[0].inStock };
}

export async function getLiveStockBySlug(slugs: string[]): Promise<Record<string, boolean>> {
  const normalizedSlugs = normalizeSlugs(slugs);
  if (normalizedSlugs.length === 0) return {};

  const baseStock: Record<string, boolean> = {};
  for (const slug of normalizedSlugs) {
    const base = getProduct(slug);
    if (base) baseStock[slug] = base.inStock;
  }

  const overrides = await listProductStockOverrides(normalizedSlugs);
  for (const override of overrides) {
    baseStock[override.slug] = override.inStock;
  }

  return baseStock;
}

export async function updateProductStock(slug: string, inStock: boolean): Promise<ProductStockRecord> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug || !getProduct(normalizedSlug)) {
    throw new Error("Unknown product");
  }

  const db = getDb();
  const updatedAt = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO product_inventory (slug, in_stock, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(slug) DO UPDATE SET
            in_stock = excluded.in_stock,
            updated_at = excluded.updated_at`,
    args: [normalizedSlug, inStock ? 1 : 0, updatedAt],
  });

  return {
    slug: normalizedSlug,
    inStock,
    updatedAt,
  };
}
