// Trang chủ (thương hiệu cá nhân): Hero cố định, rồi các khối (Câu chuyện, Cách mình đọc, Con số, Tủ sách, Bài tiêu biểu, Kết nối, Newsletter)
// theo thứ tự / bật tắt ở Keystatic (Trang → Trang chủ → Các khối); nền xen kẽ tự tính ở layoutBlocks (src/config/blocks.ts).
// Layout: docs/layout/trang-chu/README.md. Nội dung chỉnh ở Keystatic (Trang → Trang chủ); mặc định ở src/config/profile.ts. Trang Book (Trang chủ cũ) nằm ở /book.
import { getUiLabels } from "@/shared/content/ui-labels";
import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { getHomePage, getPageBlocks, getPageOgImage } from "@/shared/content/pages";
import { layoutBlocks, type LaidOutBlock } from "@/shared/config/blocks";
import { site } from "@/shared/config/site";
import { getAllPosts, getSiteStats } from "@/shared/content/posts";
import { getNewsletterSettings, getSiteSettings } from "@/shared/content/settings";
import { brushStyle, PULL_UP, toneBg, type SectionTone } from "@/frontend/lib/brush";
import { PageShell } from "@/frontend/components/layout/PageShell";
import { Newsletter } from "@/frontend/components/layout/Newsletter";
import { PersonBackdrop } from "@/frontend/components/home/PersonBackdrop";
import { PersonHero } from "@/frontend/components/home/PersonHero";
import { StorySection } from "@/frontend/components/home/StorySection";
import { PrincipleCards } from "@/frontend/components/home/PrincipleCards";
import { BookShelf } from "@/frontend/components/home/BookShelf";
import { PostCard } from "@/frontend/components/blog/PostCard";
import { BrushEcho } from "@/frontend/components/ui/BrushEcho";
import { Reveal } from "@/frontend/components/ui/Reveal";
import { RevealText } from "@/frontend/components/ui/RevealText";
import { CountUp } from "@/frontend/components/ui/Motion";
import { ArrowRightIcon } from "@/frontend/components/ui/Icon";

export function generateMetadata(): Metadata {
  const h = getHomePage();
  const title = `${h.name} — ${getSiteSettings().tagline}`;
  return {
    title: { absolute: title },
    description: h.positioning,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description: h.positioning,
      type: "profile",
      locale: site.locale,
      url: "/",
      // openGraph của trang thay hẳn openGraph của layout nên phải tự dự phòng ảnh: ảnh riêng của trang → ảnh mặc định ở Cài đặt site
      images: (() => {
        const img = getPageOgImage("homePage") ?? getSiteSettings().ogImage;
        return img ? [{ url: img }] : undefined;
      })(),
    },
  };
}

export default function HomePage() {
  const h = getHomePage();
  const hasShelf = h.shelf.books.length > 0; // tủ sách để trống trong admin thì ẩn khối
  const stats = getSiteStats();
  const featured = getAllPosts().slice(0, 3);
  // Tủ sách để trống thì khối coi như tắt (không tính vào việc xen kẽ nền)
  const layout = layoutBlocks("homePage", getPageBlocks("homePage"), hasShelf ? [] : ["shelf"]);
  const tone = (b: LaidOutBlock): SectionTone => (b.tone === "sunk" ? "sunk" : "paper");
  const blocks: Record<string, (b: LaidOutBlock) => ReactNode> = {
    story: (b) => <StorySection tone={tone(b)} pullUp={b.pullUp} />,
    principles: (b) => <PrincipleCards tone={tone(b)} pullUp={b.pullUp} />,
    // Con số: đếm từ nội dung thật
    stats: (b) => (
      <section aria-label={getUiLabels().statsSection} className={`${toneBg(tone(b))} ${b.pullUp ? PULL_UP : "pt-s7 tablet:pt-s8"} pb-s7 text-ink tablet:pb-s8`}>
        <dl className="wrap grid grid-cols-3 divide-x divide-rule text-center">
          {[
            { value: stats.posts, suffix: "+", label: h.statLabels.posts },
            { value: stats.books, suffix: "+", label: h.statLabels.books },
            { value: stats.topics, label: h.statLabels.topics },
          ].map((s) => (
            <div key={s.label} className="px-s2">
              <dd className="type-display-lg tabular-nums">
                <CountUp to={s.value} suffix={s.suffix} />
              </dd>
              <dt className="type-caption mt-s1 text-ink-faint">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>
    ),
    shelf: (b) => <BookShelf pullUp={b.pullUp} />,
    // Bài tiêu biểu: đứng ngay sau dải tối thì kéo lên dưới nét cọ để nền tràn tới mép cọ
    featured: (b) => (
      <section
        aria-labelledby="featured-title"
        className={`${toneBg(tone(b))} relative pb-s8 text-ink tablet:pb-s9 ${b.pullUp ? PULL_UP : "pt-s8"}`}
      >
        <div className="wrap">
          <Reveal className="flex flex-wrap items-end justify-between gap-x-s5 gap-y-s3">
            <h2 id="featured-title" className="type-display-lg text-balance">
              <RevealText text={h.featured.title} />
            </h2>
            <Link href="/blog" className="type-label tap inline-flex items-center gap-s2 text-accent underline underline-offset-(--underline-offset)">
              {h.featured.linkLabel}
              <ArrowRightIcon />
            </Link>
          </Reveal>
          <div className="mt-s6 grid gap-s4 tablet:grid-cols-2 desktop:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08} className={i === 0 ? "tablet:col-span-2 desktop:col-span-1" : ""}>
                <PostCard post={p} variant="tile" className="min-h-[22rem]" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    ),
    newsletter: () => (
      <div id="dang-ky">
        <Newsletter settings={getNewsletterSettings()} />
      </div>
    ),
  };
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: h.name,
    description: h.positioning,
    url: site.url,
  };

  return (
    <PageShell tone="inverse">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />

      <section
        className="on-inverse brush-bottom relative isolate z-10 overflow-hidden bg-inverse pt-(--header-height) text-on-inverse"
        style={brushStyle}
        aria-label={getUiLabels().intro}
      >
        <PersonBackdrop />
        <PersonHero stats={{ posts: stats.posts, topics: stats.topics }} />
      </section>
      <BrushEcho />

      {layout.map((b) => (
        <Fragment key={b.id}>{blocks[b.id]?.(b)}</Fragment>
      ))}
    </PageShell>
  );
}
