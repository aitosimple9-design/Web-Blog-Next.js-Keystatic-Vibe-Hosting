// Thẻ bài. `card`: lưới Blog (ảnh 3:2, nhãn, tiêu đề, tóm tắt, chân thẻ). `tile`: ô lưới bento Trang chủ.
// Bấm được CẢ thẻ nhưng chỉ có MỘT liên kết (tiêu đề kéo giãn phủ thẻ) để trình đọc màn hình không đọc lặp.
import Link from "next/link";
import { topicBySlug } from "@/config/topics";
import { formatDateLong, formatDateShort, formatReadTime } from "@/lib/format";
import type { PostMeta } from "@/lib/posts";
import { PostImage } from "@/components/ui/Media";
import { TopicTag } from "@/components/ui/Tag";
import { ArrowRightIcon } from "@/components/ui/Icon";

export function PostCard({
  post,
  variant = "card",
  priority,
  className = "",
}: {
  post: PostMeta;
  variant?: "card" | "tile";
  priority?: boolean;
  className?: string;
}) {
  const topic = topicBySlug(post.category)?.name ?? post.category;
  const href = `/bai-viet/${post.slug}`;

  if (variant === "tile") {
    return (
      <article className={`group relative flex h-full flex-col gap-s4 ${className}`}>
        <div className="min-h-0 flex-1">
          <PostImage src={post.cover} label={topic} fill priority={priority} />
        </div>
        <div className="flex flex-col gap-s2">
          <TopicTag>{topic}</TopicTag>
          <h3 className="type-title line-clamp-2">
            <Link href={href} className="no-underline after:absolute after:inset-0">
              {post.title}
            </Link>
          </h3>
          <p className="type-caption text-ink-faint">
            {formatDateLong(post.date)} · {formatReadTime(post.readingMinutes)}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className={`group relative flex h-full flex-col gap-s4 ${className}`}>
      <PostImage src={post.cover} label={topic} priority={priority} />
      <div className="flex flex-1 flex-col gap-s3">
        <TopicTag>{topic}</TopicTag>
        <h3 className="type-title line-clamp-2 text-balance">
          <Link href={href} className="no-underline after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="type-excerpt line-clamp-2 text-ink-soft">{post.description}</p>
        <div className="mt-auto flex items-center justify-between gap-s3 pt-s2">
          <p className="type-caption text-ink-faint">
            {formatDateShort(post.date)} · {post.readingMinutes} phút
          </p>
          <span className="type-label inline-flex items-center gap-s1" aria-hidden>
            Đọc bài
            <ArrowRightIcon className="transition-transform duration-200 motion-safe:group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
