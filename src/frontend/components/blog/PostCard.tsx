// Thẻ bài. `card`: lưới Blog (ảnh 3:2, nhãn, tiêu đề, tóm tắt, chân thẻ). `tile`: ô lưới bento Trang chủ.
// Bấm được CẢ thẻ nhưng chỉ có MỘT liên kết (tiêu đề kéo giãn phủ thẻ) để trình đọc màn hình không đọc lặp.
import { fillLabel } from "@/shared/config/ui-labels";
import { getUiLabels } from "@/shared/content/ui-labels";
import Link from "next/link";
import { topicBySlug } from "@/shared/content/topics";
import { formatDateLong, formatDateShort, formatReadTime } from "@/shared/format";
import type { PostMeta } from "@/shared/content/posts";
import { PostImage } from "@/frontend/components/ui/Media";
import { ArrowRightIcon } from "@/frontend/components/ui/Icon";

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
    // Vùng ảnh kéo xuống phủ cả nhãn, tiêu đề và ngày; một lớp phủ `inverse` 65% (màu phẳng) giữ chữ dễ đọc
    return (
      <article
        className={`group lift surface-hover on-inverse relative isolate flex h-full flex-col justify-end overflow-hidden rounded-md bg-inverse p-s5 text-on-inverse shadow-elevated-md ${className}`}
      >
        <div className="absolute inset-0 -z-20">
          <PostImage
            src={post.cover}
            seed={post.slug}
            label={topic}
            fill
            flat
            rounded={false}
            priority={priority}
            transitionName={`post-${post.slug}`}
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-inverse/65 transition-opacity duration-(--motion-normal) ease-(--ease-smooth) group-hover:opacity-80"
        />
        <div className="flex flex-col gap-s4">
          <span className="type-caption inline-flex w-fit rounded-pill border-(length:--border-width) border-on-inverse-soft/60 bg-on-inverse/15 px-s3 py-1 text-on-inverse">
            {topic}
          </span>
          <h3 className="type-title line-clamp-2 leading-normal">
            <Link
              href={href}
              className="no-underline after:absolute after:inset-0"
            >
              <span className="ul-grow">{post.title}</span>
            </Link>
          </h3>
          <p className="type-caption text-on-inverse-soft">
            {formatDateLong(post.date)} · {formatReadTime(post.readingMinutes, getUiLabels().readTime)}
          </p>
        </div>
      </article>
    );
  }

  // Thẻ bài (lưới Blog): cùng khuôn với thẻ chủ đề, ảnh tràn cả thẻ 3:4 phủ `inverse` 65%, chữ nằm thẳng trên ảnh, nổi `elevated`
  return (
    <article
      className={`group lift surface-hover on-inverse relative isolate flex aspect-[3/4] h-full w-full flex-col justify-end overflow-hidden rounded-lg bg-inverse p-s5 text-on-inverse shadow-elevated-lg ${className}`}
    >
      <div className="absolute inset-0 -z-20">
        <PostImage
          src={post.cover}
          seed={post.slug}
          label={topic}
          fill
          flat
          rounded={false}
          priority={priority}
          transitionName={`post-${post.slug}`}
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-inverse/65 transition-opacity duration-(--motion-normal) ease-(--ease-smooth) group-hover:opacity-80"
      />
      <div className="flex flex-col gap-s4">
        <span className="type-caption inline-flex w-fit rounded-pill border-(length:--border-width) border-on-inverse-soft/60 bg-on-inverse/15 px-s3 py-1 text-on-inverse">
          {topic}
        </span>
        <h3 className="type-display-sm line-clamp-2 text-balance leading-normal">
          <Link
            href={href}
            className="no-underline after:absolute after:inset-0"
          >
            <span className="ul-grow">{post.title}</span>
          </Link>
        </h3>
        <p className="type-excerpt line-clamp-2 text-on-inverse">
          {post.description}
        </p>
        <div className="flex items-center justify-between gap-s3">
          <p className="type-caption text-on-inverse-soft">
            {formatDateShort(post.date)} · {fillLabel(getUiLabels().readTimeShort, { n: post.readingMinutes })}
          </p>
          <span
            className="type-label inline-flex items-center gap-s1"
            aria-hidden
          >
            {getUiLabels().readPost}
            <ArrowRightIcon className="transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:group-hover:translate-x-2" />
          </span>
        </div>
      </div>
    </article>
  );
}
