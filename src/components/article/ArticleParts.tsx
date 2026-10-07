// Các khối nhỏ của trang Chi tiết bài: ArticleHeader, SourceBox (= BookRef của Design System).
import Link from "next/link";
import { topicBySlug } from "@/config/topics";
import { formatDateLong, formatReadTime } from "@/lib/format";
import type { PostMeta } from "@/lib/posts";
import { TopicTag } from "@/components/ui/Tag";
import { BookCover } from "@/components/ui/Media";

export function ArticleHeader({ post }: { post: PostMeta }) {
  const topic = topicBySlug(post.category);
  return (
    <header className="min-[1280px]:text-center">
      {topic ? (
        <Link href={`/blog/${topic.slug}`} className="tap -my-2 inline-flex items-center no-underline" aria-label={`Chủ đề ${topic.name}`}>
          <TopicTag>{topic.name}</TopicTag>
        </Link>
      ) : null}
      <h1 className="type-display-lg mt-s4 max-w-4xl text-balance min-[1280px]:mx-auto" aria-label={post.title}>
        {post.title.split(" ").map((w, i) => (
          <span key={i} aria-hidden className="word-mask mr-[0.22em]">
            <span className="anim-word" style={{ "--i": Math.min(i, 14), "--delay": "120ms" } as React.CSSProperties}>
              {w}
            </span>
          </span>
        ))}
      </h1>
      <p className="type-dek anim-fade-rise mt-s4 max-w-2xl text-ink-soft min-[1280px]:mx-auto" style={{ "--delay": "560ms" } as React.CSSProperties}>
        {post.description}
      </p>
      <p className="type-caption anim-fade-rise mt-s4 text-ink-faint" style={{ "--delay": "680ms" } as React.CSSProperties}>
        <time dateTime={post.date}>{formatDateLong(post.date)}</time> · {formatReadTime(post.readingMinutes)}
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
  return (
    <aside
      aria-label="Nguồn sách"
      className={`rounded-md border-(length:--border-width) border-rule bg-paper-raised ${
        compact ? "flex flex-col items-start gap-s3 p-s3" : "flex items-center gap-s4 p-s4"
      } ${className}`}
    >
      <BookCover size="sm" title={book} tone="deep" />
      <div className="min-w-0">
        <p className="type-eyebrow uppercase text-ink-faint">Bài viết dựa trên</p>
        {compact ? (
          <p className="type-ui-strong mt-s1 text-balance">
            {book}
            <span className="type-caption block font-normal text-ink-soft">{author}</span>
          </p>
        ) : (
          <p className="type-title mt-s1 text-balance">
            {book}
            <span className="type-ui-body block font-normal text-ink-soft">{author}</span>
          </p>
        )}
      </div>
    </aside>
  );
}
