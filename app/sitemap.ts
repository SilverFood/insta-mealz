import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

function siteOrigin(): string {
  const fromEnv = process.env.INSTAMEALZ_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const staticPaths = [
    "",
    "/products",
    "/cart",
    "/checkout",
    "/contact",
    "/privacy",
    "/terms",
    "/shipping",
    "/returns",
    "/track",
  ];

  const now = new Date();
  const staticEntries = staticPaths.map((path) => ({
    url: `${origin}${path}`,
    lastModified: now,
  }));

  const productEntries = products.map((product) => ({
    url: `${origin}/products/${product.slug}`,
    lastModified: now,
  }));

  return [...staticEntries, ...productEntries];
}
