// Bài liên quan: hàng thẻ trượt. Nền thẻ là HÌNH CHỮ NHẬT DỌC tỉ lệ 3:4, bo góc radius-lg; bố cục bên trong giữ như wireframe
// (nhãn chủ đề, tiêu đề, bìa sách nhỏ, tóm tắt, thời gian đọc); nền là ảnh bài màu gốc phủ `inverse` 55%, không còn xen kẽ đen / trắng.
// 375: 272px (lộ mép thẻ kế) · 768: 300px · 1024+: 320px · tràn ra mép phải màn hình.
import Link from "next/link";
import { topicBySlug } from "@/lib/topics";
import type { PostMeta } from "@/lib/posts";
import { Ornament } from "@/components/ui/SectionHead";
import { Slider } from "@/components/ui/Slider";
import { getArticlePage } from "@/lib/pages";
import { BookCover, PostImage } from "@/components/ui/Media";

function RelatedCard({ post }: { post: PostMeta }) {
  const topic = topicBySlug(post.category)?.name ?? post.category;
  return (
    <article className="on-inverse group relative isolate flex aspect-[3/4] w-full flex-col justify-between gap-s5 overflow-hidden rounded-lg bg-inverse p-s5 text-on-inverse shadow-elevated-lg transition-[transform,box-shadow] duration-(--motion-normal) ease-(--ease-smooth) motion-safe:hover:-translate-y-2">
      {/* Ảnh bài (màu gốc) tràn cả thẻ, phủ `inverse` 55% để chữ đọc rõ; nhạt đi khi hover */}
      <div className="absolute inset-0 -z-20 transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]">
        <PostImage
          src={post.cover}
          seed={post.slug}
          label={topic}
          fill
          flat
          rounded={false}
          sizes="320px"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-inverse/55 transition-opacity duration-(--motion-normal) ease-(--ease-smooth) group-hover:opacity-80"
      />
      <div className="flex items-start justify-between gap-s4">
        <div className="min-w-0">
          <p className="type-eyebrow uppercase text-on-inverse-soft">{topic}</p>
          <h3 className="type-title mt-s2 line-clamp-3 text-balance">
            <Link
              href={`/bai-viet/${post.slug}`}
              className="no-underline after:absolute after:inset-0"
            >
              {post.title}
            </Link>
          </h3>
        </div>
        <BookCover size="sm" title={post.source.book} className="mt-s1" />
      </div>
      <div>
        <p className="type-excerpt line-clamp-2 text-on-inverse">
          {post.description}
        </p>
        <p className="type-caption mt-s3 text-on-inverse-soft">
          {post.readingMinutes} phút đọc
        </p>
      </div>
    </article>
  );
}

export function RelatedSlider({ posts }: { posts: PostMeta[] }) {
  const { relatedTitle, relatedDek } = getArticlePage();
  if (!posts.length) return null;
  return (
    <section aria-labelledby="related-title" className="seam-both bg-paper-sunk text-ink">
      <div className="wrap py-s7 tablet:py-s9">
        <div>
          <h2
            id="related-title"
            className="type-display-lg tablet:whitespace-nowrap"
          >
            {relatedTitle}{" "}
            <span className="type-display-md font-normal text-ink-soft">
              {relatedDek}
            </span>
          </h2>
          <Ornament align="left" />
        </div>
        <div className="mt-s6">
          <Slider
            label="Danh sách bài liên quan"
            gapClassName="gap-s4"
            trackClassName="bleed-r -ml-6 -mb-24 pt-3 pb-32 pl-6 scroll-pl-6"
            itemClassName="w-[272px] tablet:w-[300px] desktop:w-[320px]"
            items={posts.map((p) => (
              <RelatedCard key={p.slug} post={p} />
            ))}
          />
        </div>
      </div>
    </section>
  );
}
