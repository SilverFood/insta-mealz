import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { ProductView } from "@/components/product-view";
import { getProduct, products } from "@/lib/products";
import { getLiveProductBySlug } from "@/lib/db/product-stock";

export const runtime = "nodejs";
const LIVE_LOOKUP_TIMEOUT_MS = 1200;

function normalizeSlug(raw: string) {
  try {
    return decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

async function loadProductWithFallback(slug: string) {
  const fallbackProduct = getProduct(slug);
  if (!fallbackProduct) return null;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), LIVE_LOOKUP_TIMEOUT_MS);
  });

  try {
    const liveProduct = await Promise.race([getLiveProductBySlug(slug), timeout]);
    if (timeoutId) clearTimeout(timeoutId);
    return liveProduct ?? fallbackProduct;
  } catch {
    if (timeoutId) clearTimeout(timeoutId);
    return fallbackProduct;
  }
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  noStore();

  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) notFound();

  const product = await loadProductWithFallback(normalizedSlug);
  if (!product) notFound();

  return <ProductView key={product.slug} product={product} />;
}
