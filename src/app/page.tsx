// Trang chủ (thương hiệu cá nhân): Hero 3D, Câu chuyện, Cách mình đọc, Con số, Tủ sách, Bài tiêu biểu, Kết nối, Newsletter.
// Layout: docs/layout/trang-chu/README.md. Nội dung chỉnh ở src/config/profile.ts. Trang Book (Trang chủ cũ) nằm ở /book.
import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/config/profile";
import { site } from "@/config/site";
import { getAllPosts, getSiteStats } from "@/lib/posts";
import { brushStyle } from "@/lib/brush";
import { PageShell } from "@/components/layout/PageShell";
import { Newsletter } from "@/components/layout/Newsletter";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { HeroBackdrop } from "@/components/home/HeroBackdrop";
import { PersonHero } from "@/components/about/PersonHero";
import { StorySection } from "@/components/about/StorySection";
import { PrincipleCards } from "@/components/about/PrincipleCards";
import { BookShelf } from "@/components/about/BookShelf";
import { PostCard } from "@/components/blog/PostCard";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/Motion";
import { ArrowRightIcon } from "@/components/ui/Icon";

const title = `${profile.name} — ${site.tagline}`;
export const metadata: Metadata = {
  title: { absolute: title },
  description: profile.positioning,
  alternates: { canonical: "/" },
  openGraph: { title, description: profile.positioning, type: "profile", locale: site.locale, url: "/" },
};

export default function HomePage() {
  const stats = getSiteStats();
  const featured = getAllPosts().slice(0, 3);
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    description: profile.positioning,
    url: site.url,
  };

  return (
    <PageShell tone="inverse">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />

      <section
        className="on-inverse brush-bottom relative isolate z-10 overflow-hidden bg-inverse text-on-inverse"
        style={brushStyle}
        aria-label="Giới thiệu"
      >
        <HeroBackdrop
          word={profile.nickname}
          orbClassName="absolute bottom-[12%] left-[4%] hidden size-[clamp(72px,9vw,128px)] tablet:block"
        />
        <PersonHero />
      </section>

      <StorySection />
      <PrincipleCards />

      {/* Con số: đếm từ nội dung thật */}
      <section aria-label="Con số" className="bg-paper py-s7 text-ink tablet:py-s8">
        <dl className="wrap grid grid-cols-3 divide-x divide-rule text-center">
          {[
            { value: stats.posts, suffix: "+", label: "Bài viết" },
            { value: stats.books, suffix: "+", label: "Cuốn sách" },
            { value: stats.topics, label: "Chủ đề" },
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
        className="relative -mt-[clamp(40px,5.5vw,64px)] bg-paper-sunk pt-[calc(clamp(40px,5.5vw,64px)+var(--space-8))] pb-s8 text-ink tablet:pb-s9"
      >
        <div className="wrap">
          <Reveal className="flex flex-wrap items-end justify-between gap-x-s5 gap-y-s3">
            <h2 id="featured-title" className="type-display-lg text-balance">
              Bài tiêu biểu
            </h2>
            <Link href="/blog" className="type-label tap inline-flex items-center gap-s2 text-accent underline underline-offset-(--underline-offset)">
              Xem tất cả bài viết
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
            Kết nối
          </p>
          <h2 id="connect-title" className="type-display-lg mt-s3 text-balance">
            Kết nối với mình
          </h2>
          <p className="type-ui-body mx-auto mt-s4 max-w-lg text-pretty text-ink-faint">
            Mình đăng ghi chép mới mỗi tuần. Theo dõi mình ở nền tảng bạn hay dùng, hoặc nhận bài thẳng qua email ngay bên dưới.
          </p>
          <SocialIcons className="mt-s5 justify-center" />
        </Reveal>
      </section>

      <div id="dang-ky">
        <Newsletter />
      </div>
    </PageShell>
  );
}
