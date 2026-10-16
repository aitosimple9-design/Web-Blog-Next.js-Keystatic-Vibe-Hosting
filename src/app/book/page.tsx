// Trang Book (trước đây là Trang chủ): Hero tối, chủ đề, bài mới, Newsletter. Layout: docs/layout/book/README.md
import type { Metadata } from "next";
import { getNewsletterSettings, getSiteSettings } from "@/lib/settings";
import { getBookPage } from "@/lib/pages";
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

export function generateMetadata(): Metadata {
  const s = getSiteSettings();
  const b = getBookPage();
  return {
    title: { absolute: `${b.title} — ${s.name}` },
    description: b.description || s.description,
    alternates: { canonical: "/book" },
  };
}

export default function BookPage() {
  const b = getBookPage();
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
        <HeroBackdrop word={b.hero.backdropWord} />
        <Hero
          featured={featured}
          text={b.hero}
          stats={[
            { value: stats.posts, suffix: "+", label: b.hero.statPosts },
            { value: stats.topics, label: b.hero.statTopics },
            { value: stats.books, suffix: "+", label: b.hero.statBooks },
          ]}
        />
      </section>
      <div className="bg-paper py-s4 text-ink-soft tablet:py-s5">
        <ScrollMarquee words={b.marquee} className="type-display-sm font-medium tracking-wide" />
      </div>
      <TopicSlider topics={getTopics()} counts={countByTopic()} text={b.topics} />
      <LatestGrid posts={rest.slice(0, 4)} total={stats.posts} text={b.latest} />
      <Newsletter settings={getNewsletterSettings()} />
    </PageShell>
  );
}
