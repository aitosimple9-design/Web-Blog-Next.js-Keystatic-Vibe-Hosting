// Trang Blog: dải đầu trang tối (tiêu đề, menu chủ đề, Hero chủ đề) → khối danh sách bài gối lên đáy dải tối → Newsletter.
// URL (Q13, giả định): /blog/<chu-de> và /blog/<chu-de>/trang/<n>; 6 bài mỗi trang, lưới tự đổi số cột (1 / 2 / 3).
import Image from "next/image";
import { brushStyle } from "@/frontend/lib/brush";
import { getNewsletterSettings, getSiteSettings } from "@/shared/content/settings";
import { getBlogPage, getPageBlocks, getPageOgImage } from "@/shared/content/pages";
import { topicBySlug, getTopics } from "@/shared/content/topics";
import {
  countByTopic,
  getPostsByTopic,
  topicAvgMinutes,
  topicBookCount,
} from "@/shared/content/posts";
import { PageShell } from "@/frontend/components/layout/PageShell";
import { Newsletter } from "@/frontend/components/layout/Newsletter";
import { TopicMenu, TopicTabs } from "@/frontend/components/blog/TopicNav";
import { TopicHero } from "@/frontend/components/blog/TopicHero";
import { PostCard } from "@/frontend/components/blog/PostCard";
import { Pagination } from "@/frontend/components/blog/Pagination";
import { Reveal } from "@/frontend/components/ui/Reveal";
import { RevealText } from "@/frontend/components/ui/RevealText";
import { Breadcrumb } from "@/frontend/components/ui/Breadcrumb";
import { Ornament } from "@/frontend/components/ui/SectionHead";
import type { Metadata } from "next";

export const topicHref = (slug: string, page = 1) =>
  page <= 1 ? `/blog/${slug}` : `/blog/${slug}/trang/${page}`;

export const totalPagesFor = (slug: string) =>
  Math.max(1, Math.ceil(getPostsByTopic(slug).length / getSiteSettings().postsPerPage));

export function blogMetadata(slug: string, page: number): Metadata {
  const topic = topicBySlug(slug)!;
  const bp = getBlogPage();
  const title =
    page > 1
      ? `${topic.name} — ${bp.pageLabel.replace("{page}", String(page))}`
      : `${topic.name} — ${bp.titleSuffix}`;
  return {
    title,
    description: topic.description,
    alternates: { canonical: topicHref(slug, page) },
    openGraph: {
      title: `${title} | ${getSiteSettings().name}`,
      description: topic.description,
      type: "website",
      // Ảnh chia sẻ chung của trang Blog → ảnh mặc định ở Cài đặt site (openGraph của trang thay hẳn của layout)
      images: (() => {
        const img = getPageOgImage("blogPage") ?? getSiteSettings().ogImage;
        return img ? [{ url: img }] : undefined;
      })(),
    },
  };
}

export function BlogView({ slug, page }: { slug: string; page: number }) {
  const bp = getBlogPage();
  const showNewsletter = getPageBlocks("blogPage").some((b) => b.id === "newsletter" && b.enabled); // bật / tắt ở Keystatic (Trang → Trang Blog → Các khối)
  const topic = topicBySlug(slug)!;
  const all = getPostsByTopic(slug);
  const perPage = getSiteSettings().postsPerPage;
  const totalPages = Math.max(1, Math.ceil(all.length / perPage));
  const posts = all.slice((page - 1) * perPage, page * perPage);
  const counts = countByTopic();
  const books = [...new Set(all.map((p) => p.source.book))].slice(0, 3);

  return (
    <PageShell tone="inverse">
      <section
        className="on-inverse brush-bottom relative isolate z-10 overflow-hidden bg-inverse text-on-inverse"
        style={brushStyle}
        aria-label="Chủ đề"
      >
        {/* Ảnh nền theo chủ đề; lớp nền đặc `inverse` phủ lên để chữ vẫn đọc rõ (chữ không nằm trực tiếp trên ảnh) */}
        <Image
          key={slug}
          src={topic.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="anim-page -z-20 object-cover grayscale-[40%]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-inverse/80" />
        <div className="wrap relative pt-[calc(var(--header-height)+var(--space-4))] tablet:pt-[calc(var(--header-height)+var(--space-5))]">
          {/* Tiêu đề "Blog" và dòng giới thiệu ẩn khỏi mắt nhìn (vẫn có cho trình đọc màn hình và SEO) */}
          <h1 className="sr-only">{bp.heading}</h1>
          <p className="sr-only">{bp.intro}</p>
          <Breadcrumb
            items={[
              { label: bp.breadcrumb.home, href: "/" },
              { label: bp.breadcrumb.blog, href: "/blog" },
              { label: topic.name },
            ]}
          />
          <div className="mt-[28px] tablet:mt-[36px]">
            <TopicMenu topics={getTopics()} current={slug} />
            <TopicTabs topics={getTopics()} current={slug} />
          </div>
          <TopicHero
            key={slug}
            topic={topic}
            topics={getTopics()}
            counts={counts}
            books={books.length ? books : ["Sách mẫu"]}
            latestHref={all[0] ? `/bai-viet/${all[0].slug}` : undefined}
            stats={[
              { value: all.length, label: bp.hero.statPosts },
              { value: topicBookCount(slug), label: bp.hero.statBooks },
              { value: topicAvgMinutes(slug), label: bp.hero.statMinutes },
            ]}
          />
        </div>
      </section>

      <section
        aria-labelledby="post-list-title"
        className="relative z-0 -mt-[clamp(40px,5.5vw,64px)] bg-paper pt-[clamp(40px,5.5vw,64px)] text-ink"
      >
        <div className="wrap py-s7 tablet:py-s8">
          <div className="mb-s6">
            <div className="flex flex-wrap items-center justify-between gap-x-s5 gap-y-s3">
              <h2 id="post-list-title" className="type-display-lg text-balance">
                <RevealText text={bp.listTitle.replace("{topic}", topic.name)} />
              </h2>
              <p className="type-caption inline-flex shrink-0 items-baseline gap-1 rounded-pill border-(length:--border-width) border-rule-strong bg-accent-soft px-s4 py-s1 text-accent-soft-ink">
                <span className="type-ui-strong tabular-nums">
                  {all.length}
                </span>{" "}
                bài · trang {page}/{totalPages}
              </p>
            </div>
            <Ornament align="left" />
          </div>

          {posts.length ? (
            <ul className="grid gap-x-s5 gap-y-s7 tablet:grid-cols-2 desktop:grid-cols-3">
              {posts.map((p, i) => (
                <li key={p.slug}>
                  <Reveal delay={(i % 3) * 0.06} className="h-full">
                    <PostCard post={p} priority={page === 1 && i < 2} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <p className="type-ui-body py-s8 text-center text-ink-soft">
              {bp.emptyText}
            </p>
          )}

          <Pagination
            current={page}
            total={totalPages}
            hrefFor={(n) => topicHref(slug, n)}
          />
        </div>
      </section>

      {showNewsletter ? <Newsletter settings={getNewsletterSettings()} /> : null}
    </PageShell>
  );
}
