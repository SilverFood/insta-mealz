"use client";

import { useEffect, useMemo, useState } from "react";
import { products as baseProducts, type Product } from "@/lib/products";

type LiveProductsResponse = {
  products?: Product[];
};

function mergeLiveProducts(next: Product[]): Product[] {
  const bySlug = new Map(next.map((product) => [product.slug, product]));
  return baseProducts.map((product) => {
    const live = bySlug.get(product.slug);
    if (!live) return product;
    return { ...product, ...live, inStock: live.inStock };
  });
}

export function useLiveProducts() {
  const [products, setProducts] = useState<Product[]>(baseProducts);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/products/stock", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as LiveProductsResponse;
        if (!res.ok || !Array.isArray(data.products) || cancelled) return;
        setProducts(mergeLiveProducts(data.products));
      } catch {
        // Keep static catalog fallback if live stock fetch fails.
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const bySlug = useMemo(() => {
    const map: Record<string, Product> = {};
    for (const product of products) {
      map[product.slug] = product;
    }
    return map;
  }, [products]);

  return { products, bySlug };
}
