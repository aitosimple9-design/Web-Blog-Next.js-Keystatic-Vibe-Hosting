// Trang chủ (thương hiệu cá nhân): Hero 3D, Câu chuyện, Cách mình đọc, Con số, Tủ sách, Bài tiêu biểu, Kết nối, Newsletter.
// Layout: docs/layout/trang-chu/README.md. Nội dung chỉnh ở Keystatic (Trang → Trang chủ); mặc định ở src/config/profile.ts. Trang Book (Trang chủ cũ) nằm ở /book.
import type { Metadata } from "next";
import Link from "next/link";
import { getHomePage } from "@/lib/pages";
import { site } from "@/config/site";
import { getAllPosts, getSiteStats } from "@/lib/posts";
import { getNewsletterSettings, getSiteSettings } from "@/lib/settings";
import { brushStyle } from "@/lib/brush";
import { PageShell } from "@/components/layout/PageShell";
import { Newsletter } from "@/components/layout/Newsletter";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { PersonBackdrop } from "@/components/about/PersonBackdrop";
import { PersonHero } from "@/components/about/PersonHero";
import { StorySection } from "@/components/about/StorySection";
import { PrincipleCards } from "@/components/about/PrincipleCards";
import { BookShelf } from "@/components/about/BookShelf";
import { PostCard } from "@/components/blog/PostCard";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { CountUp } from "@/components/ui/Motion";
import { ArrowRightIcon } from "@/components/ui/Icon";

export function generateMetadata(): Metadata {
  const h = getHomePage();
  const title = `${h.name} — ${getSiteSettings().tagline}`;
  return {
    title: { absolute: title },
    description: h.positioning,
    alternates: { canonical: "/" },
    openGraph: { title, description: h.positioning, type: "profile", locale: site.locale, url: "/" },
  };
}

export default function HomePage() {
  const h = getHomePage();
  const hasShelf = h.shelf.books.length > 0; // tủ sách để trống trong admin thì ẩn khối
  const stats = getSiteStats();
  const featured = getAllPosts().slice(0, 3);
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
        aria-label="Giới thiệu"
      >
        <PersonBackdrop />
        <PersonHero stats={{ posts: stats.posts, topics: stats.topics }} />
      </section>

      <StorySection />
      <PrincipleCards />

      {/* Con số: đếm từ nội dung thật */}
      <section aria-label="Con số" className="bg-paper py-s7 text-ink tablet:py-s8">
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

      <BookShelf />

      {/* Bài tiêu biểu: kéo lên dưới nét cọ của Tủ sách để nền paper-sunk tràn tới mép cọ */}
      <section
        aria-labelledby="featured-title"
        className={`relative bg-paper-sunk pb-s8 text-ink tablet:pb-s9 ${
          hasShelf ? "-mt-[clamp(40px,5.5vw,64px)] pt-[calc(clamp(40px,5.5vw,64px)+var(--space-8))]" : "pt-s8"
        }`}
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

      {/* Kết nối */}
      <section aria-labelledby="connect-title" className="bg-paper py-s8 text-center text-ink">
        <Reveal className="wrap mx-auto max-w-2xl">
          <p className="type-eyebrow flex items-center justify-center gap-s2 uppercase text-ink-faint">
            <span aria-hidden className="block size-1.5 rotate-45 rounded-[1px] bg-accent-warm" />
            {h.connect.eyebrow}
          </p>
          <h2 id="connect-title" className="type-display-lg mt-s3 text-balance">
            <RevealText text={h.connect.title} />
          </h2>
          <p className="type-ui-body mx-auto mt-s4 max-w-lg text-pretty text-ink-faint">
            {h.connect.text}
          </p>
          <SocialIcons className="mt-s5 justify-center" />
        </Reveal>
      </section>

      <div id="dang-ky">
        <Newsletter settings={getNewsletterSettings()} />
      </div>
    </PageShell>
  );
}
