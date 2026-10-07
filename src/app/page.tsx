// Trang chủ (trang đích từ quảng cáo). Layout: docs/layout/trang-chu/README.md
import type { Metadata } from "next";
import { site } from "@/config/site";
import { topics } from "@/config/topics";
import { countByTopic, getAllPosts, getSiteStats } from "@/lib/posts";
import { PageShell } from "@/components/layout/PageShell";
import { Newsletter } from "@/components/layout/Newsletter";
import { Hero } from "@/components/home/Hero";
import { TopicSlider } from "@/components/home/TopicSlider";
import { LatestGrid } from "@/components/home/LatestGrid";
import { ScrollMarquee } from "@/components/ui/Motion";

export const metadata: Metadata = {
  title: { absolute: `${site.name} — ${site.tagline}` },
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const posts = getAllPosts();
  const stats = getSiteStats();
  const [featured, ...rest] = posts;
  return (
    <PageShell tone="sunk">
      <section className="seam-bottom bg-paper-sunk text-ink" aria-label="Giới thiệu">
        <Hero
          featured={featured}
          stats={[
            { value: stats.posts, suffix: "+", label: "Bài viết" },
            { value: stats.topics, label: "Chủ đề" },
            { value: stats.books, suffix: "+", label: "Cuốn sách" },
          ]}
        />
      </section>
      <div className="bg-paper py-s4 text-ink-soft tablet:py-s5">
        <ScrollMarquee words={["Đọc", "Ghi chép", "Suy ngẫm", "Áp dụng", "Nhớ lâu"]} className="type-display-sm font-medium tracking-wide" />
      </div>
      <TopicSlider topics={topics} counts={countByTopic()} />
      <LatestGrid posts={rest.slice(0, 4)} total={stats.posts} />
      <Newsletter />
    </PageShell>
  );
}
