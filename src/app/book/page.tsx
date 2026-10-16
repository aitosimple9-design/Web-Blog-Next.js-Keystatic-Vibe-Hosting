// Trang Book (trước đây là Trang chủ): Hero tối, chủ đề, bài mới, Newsletter. Layout: docs/layout/book/README.md
import type { Metadata } from "next";
import { site } from "@/config/site";
import { getTopics } from "@/lib/topics";
import { countByTopic, getAllPosts, getSiteStats } from "@/lib/posts";
import { PageShell } from "@/components/layout/PageShell";
import { Newsletter } from "@/components/layout/Newsletter";
import { Hero } from "@/components/home/Hero";
import { HeroBackdrop } from "@/components/home/HeroBackdrop";
import { brushStyle } from "@/lib/brush";
import { TopicSlider } from "@/components/home/TopicSlider";
import { LatestGrid } from "@/components/home/LatestGrid";
import { ScrollMarquee } from "@/components/ui/Motion";

export const metadata: Metadata = {
  title: { absolute: `Book — ${site.name}` },
  description: site.description,
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  const posts = getAllPosts();
  const stats = getSiteStats();
  const [featured, ...rest] = posts;
  return (
    <PageShell tone="inverse">
      <section
        className="on-inverse brush-bottom relative isolate z-10 overflow-hidden bg-inverse pt-(--header-height) text-on-inverse"
        style={brushStyle}
        aria-label="Giới thiệu"
      >
        <HeroBackdrop />
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
      <TopicSlider topics={getTopics()} counts={countByTopic()} />
      <LatestGrid posts={rest.slice(0, 4)} total={stats.posts} />
      <Newsletter />
    </PageShell>
  );
}
