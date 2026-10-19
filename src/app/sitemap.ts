import type { MetadataRoute } from "next";
import { site } from "@/shared/config/site";
import { getTopics } from "@/shared/content/topics";
import { getAllPosts } from "@/shared/content/posts";
import { getVisibleLegalPages } from "@/shared/content/legal-pages";
import { totalPagesFor } from "@/frontend/components/blog/BlogView";

// Bài nháp và bài lên lịch (ngày đăng ở tương lai) không có trong getAllPosts() nên không vào sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  return [
    { url: u("/"), changeFrequency: "weekly", priority: 1 },
    { url: u("/book"), changeFrequency: "weekly", priority: 0.9 },
    ...getVisibleLegalPages().map((p) => ({ url: u(p.href), changeFrequency: "yearly" as const, priority: 0.3 })),
    ...getTopics().flatMap((t) =>
      Array.from({ length: totalPagesFor(t.slug) }, (_, i) => ({
        url: u(i === 0 ? `/blog/${t.slug}` : `/blog/${t.slug}/trang/${i + 1}`),
        changeFrequency: "weekly" as const,
        priority: i === 0 ? 0.7 : 0.4,
      })),
    ),
    ...getAllPosts().map((p) => ({
      url: u(`/bai-viet/${p.slug}`),
      lastModified: p.date,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
