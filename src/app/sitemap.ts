import type { MetadataRoute } from "next";
import { site } from "@/shared/config/site";
import { getTopics } from "@/shared/content/topics";
import { getAllPosts } from "@/shared/content/posts";
import { getVisibleLegalPages } from "@/shared/content/legal-pages";
import { subtopicsWithPosts, totalPagesFor } from "@/frontend/components/blog/BlogView";
import { subtopicHref } from "@/shared/blog-links";

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
    // Chủ đề con có bài đã đăng (chủ đề con rỗng không có trang)
    ...getTopics().flatMap((t) =>
      subtopicsWithPosts(t.slug).flatMap((s) =>
        Array.from({ length: totalPagesFor(t.slug, s.slug) }, (_, i) => ({
          url: u(subtopicHref(t.slug, s.slug, i + 1)),
          changeFrequency: "weekly" as const,
          priority: i === 0 ? 0.6 : 0.3,
        })),
      ),
    ),
    ...getAllPosts().map((p) => ({
      url: u(`/bai-viet/${p.slug}`),
      lastModified: p.date,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
