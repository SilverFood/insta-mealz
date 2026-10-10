import type { MetadataRoute } from "next";

function siteOrigin(): string | null {
  const fromEnv = process.env.INSTAMEALZ_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return null;
}

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}),
  };
}
