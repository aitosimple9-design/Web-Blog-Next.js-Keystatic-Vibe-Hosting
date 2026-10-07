// Trang Blog: dải đầu trang tối (tiêu đề, menu chủ đề, Hero chủ đề) → khối danh sách bài gối lên đáy dải tối → Newsletter.
// URL (Q13, giả định): /blog/<chu-de> và /blog/<chu-de>/trang/<n>; 6 bài mỗi trang, lưới tự đổi số cột (1 / 2 / 3).
import { POSTS_PER_PAGE, site } from "@/config/site";
import { topicBySlug, topics } from "@/config/topics";
import { countByTopic, getPostsByTopic, topicAvgMinutes, topicBookCount } from "@/lib/posts";
import { PageShell } from "@/components/layout/PageShell";
import { Newsletter } from "@/components/layout/Newsletter";
import { TopicMenu, TopicTabs } from "@/components/blog/TopicNav";
import { TopicHero } from "@/components/blog/TopicHero";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/blog/Pagination";
import { Reveal } from "@/components/ui/Reveal";
import type { Metadata } from "next";

export const topicHref = (slug: string, page = 1) =>
  page <= 1 ? `/blog/${slug}` : `/blog/${slug}/trang/${page}`;

export const totalPagesFor = (slug: string) =>
  Math.max(1, Math.ceil(getPostsByTopic(slug).length / POSTS_PER_PAGE));

export function blogMetadata(slug: string, page: number): Metadata {
  const topic = topicBySlug(slug)!;
  const title = page > 1 ? `${topic.name} — trang ${page}` : `${topic.name} — Blog`;
  return {
    title,
    description: topic.description,
    alternates: { canonical: topicHref(slug, page) },
    openGraph: { title: `${title} | ${site.name}`, description: topic.description, type: "website" },
  };
}

export function BlogView({ slug, page }: { slug: string; page: number }) {
  const topic = topicBySlug(slug)!;
  const all = getPostsByTopic(slug);
  const totalPages = Math.max(1, Math.ceil(all.length / POSTS_PER_PAGE));
  const posts = all.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  const counts = countByTopic();
  const books = [...new Set(all.map((p) => p.source.book))].slice(0, 3);

  return (
    <PageShell tone="inverse">
      <section className="on-inverse bg-inverse text-on-inverse" aria-label="Chủ đề">
        <div className="wrap pt-s6 tablet:pt-s7">
          <div className="text-center desktop:text-left">
            <h1 className="type-display-lg">Blog</h1>
            <p className="type-dek mx-auto mt-s3 max-w-2xl text-on-inverse-soft desktop:mx-0">
              Các bài ghi chép theo từng cuốn sách và chủ đề. Chọn một chủ đề để xem danh sách bài của chủ đề đó.
            </p>
          </div>
          <div className="mt-s6">
            <TopicMenu topics={topics} current={slug} />
            <TopicTabs topics={topics} current={slug} />
          </div>
          <TopicHero
            topic={topic}
            topics={topics}
            counts={counts}
            books={books.length ? books : ["Sách mẫu"]}
            latestHref={all[0] ? `/bai-viet/${all[0].slug}` : undefined}
            stats={[
              { value: all.length, label: "Bài viết" },
              { value: topicBookCount(slug), label: "Cuốn sách" },
              { value: topicAvgMinutes(slug), label: "Phút đọc TB" },
            ]}
          />
        </div>
      </section>

      <section
        aria-labelledby="post-list-title"
        className="relative -mt-s7 rounded-t-lg bg-paper text-ink"
      >
        <div className="wrap py-s7 tablet:py-s8">
          <div className="mb-s6 flex flex-wrap items-baseline justify-between gap-x-s5 gap-y-s2">
            <h2 id="post-list-title" className="type-display-sm">
              Bài viết trong {topic.name}
            </h2>
            <p className="type-caption text-ink-faint">
              {all.length} bài · trang {page}/{totalPages}
            </p>
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
              Chủ đề này chưa có bài viết. Hãy quay lại sau nhé.
            </p>
          )}

          <Pagination current={page} total={totalPages} hrefFor={(n) => topicHref(slug, n)} />
        </div>
      </section>

      <Newsletter />
    </PageShell>
  );
}
