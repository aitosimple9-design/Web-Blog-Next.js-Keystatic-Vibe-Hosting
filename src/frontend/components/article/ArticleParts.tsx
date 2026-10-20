// Các khối nhỏ của trang Chi tiết bài: ArticleHeader, SourceBox (= BookRef của Design System).
import { getUiLabels } from "@/shared/content/ui-labels";
import Link from "next/link";
import { topicBySlug } from "@/shared/content/topics";
import { formatDateLong, formatReadTime } from "@/shared/format";
import type { PostMeta } from "@/shared/content/posts";
import Image from "next/image";
import { getBookCover } from "@/shared/content/books";
import { getArticlePage } from "@/shared/content/pages";
import { CoverArt } from "@/frontend/components/ui/CoverArt";
import { BookCover } from "@/frontend/components/ui/Media";

export function ArticleHeader({ post }: { post: PostMeta }) {
  const topic = topicBySlug(post.category);
  return (
    <header className="flex flex-col items-center text-center">
      {topic ? (
        <Link
          href={`/blog/${topic.slug}`}
          className="tap -my-2 inline-flex items-center no-underline"
          aria-label={`Chủ đề ${topic.name}`}
        >
          <span className="type-caption inline-flex rounded-pill border-(length:--border-width) border-on-inverse-soft/60 bg-on-inverse/15 px-s3 py-1 text-on-inverse transition-colors duration-(--motion-fast) hover:bg-on-inverse/25">
            {topic.name}
          </span>
        </Link>
      ) : null}
      <h1
        className="type-display-lg mt-s5 max-w-4xl text-balance text-on-inverse"
        aria-label={post.title}
      >
        {post.title.split(" ").map((w, i) => (
          <span key={i} aria-hidden className="word-mask mr-[0.22em]">
            <span
              className="anim-word"
              style={
                {
                  "--i": Math.min(i, 14),
                  "--delay": "120ms",
                } as React.CSSProperties
              }
            >
              {w}
            </span>
          </span>
        ))}
      </h1>
      <p
        className="type-dek anim-fade-rise mt-s5 max-w-2xl text-on-inverse"
        style={{ "--delay": "560ms" } as React.CSSProperties}
      >
        {post.description}
      </p>
      <p
        className="type-caption anim-fade-rise mt-s5 text-on-inverse-soft"
        style={{ "--delay": "680ms" } as React.CSSProperties}
      >
        <time dateTime={post.date}>{formatDateLong(post.date)}</time> ·{" "}
        {formatReadTime(post.readingMinutes, getUiLabels().readTime)}
      </p>
    </header>
  );
}

/**
 * Nguồn sách: "Bài viết dựa trên" + tên sách — tác giả.
 *  - `compact`: thẻ đứng có bìa làm nền, cột phải hẹp ở 1280px+ (khung gần tỉ lệ bìa nên không bị kéo giãn).
 *  - `variant="strip"`: dải ngang, bìa nhỏ đúng tỉ lệ 2:3 bên trái + chữ bên phải, KHÔNG có khung riêng (khung do nơi dùng đặt).
 *    Dùng dưới 1280px, nơi khung ngang không hợp để phóng bìa dọc làm nền (trước đây bị cắt, trông như biến dạng).
 */
export function SourceBox({
  book,
  author,
  className = "",
  compact = false,
  variant = "card",
}: {
  book: string;
  author: string;
  className?: string;
  compact?: boolean;
  variant?: "card" | "strip";
}) {
  const cover = getBookCover(book);
  const { sourceLabel } = getArticlePage();
  if (variant === "strip") {
    return (
      <aside aria-label={getUiLabels().sourceBook} className={`flex items-center gap-s4 ${className}`}>
        <BookCover src={cover} seed={book} className="w-14! tablet:w-16!" />
        <div className="min-w-0">
          <p className="type-eyebrow uppercase text-ink-faint">{sourceLabel}</p>
          <p className="type-title mt-s1 text-balance text-ink">{book}</p>
          <p className="type-caption mt-s1 text-ink-soft">{author}</p>
        </div>
      </aside>
    );
  }
  return (
    <aside
      aria-label={getUiLabels().sourceBook}
      className={`on-inverse group relative isolate flex flex-col justify-end overflow-hidden rounded-lg bg-inverse p-s4 text-on-inverse shadow-elevated-md ${
        compact ? "aspect-[3/4]" : "min-h-52 tablet:min-h-60"
      } ${className}`}
    >
      {/* Bìa sách làm nền cả khối (phóng to, chỉ lấy phần hình phía trên để chữ trên bìa không chồng chữ của khối); lớp phủ `inverse` 45% (màu phẳng) giữ chữ dễ đọc */}
      <div className="absolute inset-x-0 top-0 -z-20 h-[165%]">
        {cover ? (
          <Image
            src={cover}
            alt={`Bìa sách ${book}`}
            fill
            sizes="(min-width: 1280px) 220px, 100vw"
            unoptimized={cover.endsWith(".svg")}
            className="object-cover object-center transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]"
          />
        ) : (
          <CoverArt seed={book} orientation="tall" />
        )}
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-inverse/45" />
      <p className="type-caption absolute top-s4 left-s4 inline-flex w-fit rounded-pill border-(length:--border-width) border-on-inverse-soft/60 bg-on-inverse/15 px-s3 py-1 whitespace-nowrap text-on-inverse">
        {sourceLabel}
      </p>
      <div className="min-w-0">
        <p
          className={`${compact ? "type-title" : "type-display-sm"} text-balance`}
        >
          {book}
        </p>
        <p className="type-caption mt-s1 text-on-inverse">{author}</p>
      </div>
    </aside>
  );
}
