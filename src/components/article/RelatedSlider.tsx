// Bài liên quan: hàng thẻ trượt. 375: 272px (lộ mép thẻ kế) · 768: 300px · 1024+: 320px · tràn ra mép phải màn hình.
import Link from "next/link";
import { topicBySlug } from "@/config/topics";
import type { PostMeta } from "@/lib/posts";
import { Slider } from "@/components/ui/Slider";
import { BookCover } from "@/components/ui/Media";

function RelatedCard({ post, dark }: { post: PostMeta; dark: boolean }) {
  const topic = topicBySlug(post.category)?.name ?? post.category;
  return (
    <article
      className={`group relative flex h-full min-h-72 flex-col justify-between gap-s5 rounded-md p-s5 transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:hover:-translate-y-2 ${
        dark ? "on-inverse bg-inverse text-on-inverse" : "bg-paper-raised text-ink"
      }`}
    >
      <div className="flex items-start justify-between gap-s4">
        <div className="min-w-0">
          <p className={`type-eyebrow uppercase ${dark ? "text-on-inverse-soft" : "text-ink-faint"}`}>{topic}</p>
          <h3 className="type-title mt-s2 line-clamp-3 text-balance">
            <Link href={`/bai-viet/${post.slug}`} className="no-underline after:absolute after:inset-0">
              {post.title}
            </Link>
          </h3>
        </div>
        <BookCover size="sm" title={post.source.book} tone={dark ? "sunk" : "deep"} className="mt-s1" />
      </div>
      <div>
        <p className={`type-excerpt line-clamp-2 ${dark ? "text-on-inverse-soft" : "text-ink-soft"}`}>{post.description}</p>
        <p className={`type-caption mt-s3 ${dark ? "text-on-inverse-soft" : "text-ink-faint"}`}>
          {post.readingMinutes} phút đọc
        </p>
      </div>
    </article>
  );
}

export function RelatedSlider({ posts }: { posts: PostMeta[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="related-title" className="bg-paper-sunk text-ink">
      <div className="wrap py-s7 tablet:py-s9">
        <h2 id="related-title" className="type-display-md max-w-3xl text-balance">
          Bài liên quan.{" "}
          <span className="font-normal text-ink-soft">Đọc tiếp những bài cùng chủ đề.</span>
        </h2>
        <div className="mt-s6">
          <Slider
            label="Danh sách bài liên quan"
            gapClassName="gap-s4"
            trackClassName="bleed-r pb-1"
            itemClassName="w-[272px] tablet:w-[300px] desktop:w-[320px]"
            items={posts.map((p, i) => (
              <RelatedCard key={p.slug} post={p} dark={i % 2 === 0} />
            ))}
          />
        </div>
      </div>
    </section>
  );
}
