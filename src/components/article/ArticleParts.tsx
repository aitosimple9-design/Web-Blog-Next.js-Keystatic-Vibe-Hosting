// Các khối nhỏ của trang Chi tiết bài: ArticleHeader, SourceBox (= BookRef của Design System).
import Link from "next/link";
import { topicBySlug } from "@/config/topics";
import { formatDateLong, formatReadTime } from "@/lib/format";
import type { PostMeta } from "@/lib/posts";
import Image from "next/image";
import { bookCovers } from "@/config/covers";
import { CoverArt } from "@/components/ui/CoverArt";

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
        {formatReadTime(post.readingMinutes)}
      </p>
    </header>
  );
}

/** Nguồn sách: "Bài viết dựa trên" + tên sách — tác giả. `compact`: cột phải hẹp ở 1280px+. */
export function SourceBox({
  book,
  author,
  className = "",
  compact = false,
}: {
  book: string;
  author: string;
  className?: string;
  compact?: boolean;
}) {
  const cover = bookCovers[book];
  return (
    <aside
      aria-label="Nguồn sách"
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
        Bài viết dựa trên
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
