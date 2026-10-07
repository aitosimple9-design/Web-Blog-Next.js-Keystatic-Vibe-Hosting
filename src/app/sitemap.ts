import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { topics } from "@/config/topics";
import { getAllPosts } from "@/lib/posts";
import { totalPagesFor } from "@/components/blog/BlogView";

// Bài nháp (draft: true) không có trong getAllPosts() nên không vào sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  return [
    { url: u("/"), changeFrequency: "weekly", priority: 1 },
    ...topics.flatMap((t) =>
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
