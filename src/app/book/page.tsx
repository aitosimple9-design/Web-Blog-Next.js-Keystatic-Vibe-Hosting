// Trang Book (trước đây là Trang chủ): Hero tối cố định, rồi các khối (dải chữ chạy, chủ đề, bài mới, Newsletter) theo thứ tự / bật tắt ở Keystatic. Layout: docs/layout/book/README.md
import type { Metadata } from "next";
import { getNewsletterSettings, getSiteSettings } from "@/lib/settings";
import { Fragment, type ReactNode } from "react";
import { getBookPage, getPageBlocks, getPageOgImage } from "@/lib/pages";
import { layoutBlocks, type LaidOutBlock } from "@/config/blocks";
import type { SectionTone } from "@/lib/brush";
import { getTopics } from "@/lib/topics";
import { site } from "@/config/site";
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
    // Có ảnh chia sẻ riêng thì khai báo lại openGraph (thay hẳn của layout) kèm ảnh; không thì kế thừa của layout
    ...(getPageOgImage("bookPage")
      ? { openGraph: { type: "website", locale: site.locale, siteName: s.name, title: `${b.title} — ${s.name}`, description: b.description || s.description, images: [{ url: getPageOgImage("bookPage")! }] } }
      : {}),
  };
}

export default function BookPage() {
  const b = getBookPage();
  const posts = getAllPosts();
  const stats = getSiteStats();
  const [featured, ...rest] = posts;
  const layout = layoutBlocks("bookPage", getPageBlocks("bookPage"));
  const tone = (b: LaidOutBlock): SectionTone => (b.tone === "sunk" ? "sunk" : "paper");
  const blocks: Record<string, (b: LaidOutBlock) => ReactNode> = {
    marquee: () => (
      <div className="bg-paper py-s4 text-ink-soft tablet:py-s5">
        <ScrollMarquee words={b.marquee} className="type-display-sm font-medium tracking-wide" />
      </div>
    ),
    topics: (l) => <TopicSlider topics={getTopics()} counts={countByTopic()} text={b.topics} tone={tone(l)} pullUp={l.pullUp} />,
    latest: (l) => <LatestGrid posts={rest.slice(0, 4)} total={stats.posts} text={b.latest} tone={tone(l)} pullUp={l.pullUp} />,
    newsletter: () => <Newsletter settings={getNewsletterSettings()} />,
  };
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
      {layout.map((b) => (
        <Fragment key={b.id}>{blocks[b.id]?.(b)}</Fragment>
      ))}
    </PageShell>
  );
}
