import type { MetadataRoute } from "next";
import { site } from "@/shared/config/site";
import { isIndexable } from "@/frontend/lib/indexing";

export default function robots(): MetadataRoute.Robots {
  // Không phải production (preview của Vercel, máy cá nhân...): chặn toàn bộ, không công bố sitemap
  if (!isIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/xem-truoc/", "/keystatic/", "/api/"] }, sitemap: `${site.url}/sitemap.xml` };
}
