// Ảnh bài (3:2, radius-md) và bìa sách (2:3, radius-cover, cover-shadow — đổ bóng DUY NHẤT của hệ thống).
// Chưa có ảnh thật thì dùng ô giữ chỗ (paper-deep), luôn có tỉ lệ cố định để trang không nhảy khi ảnh tải.
import Image from "next/image";

type PostImageProps = {
  src?: string;
  alt?: string;
  label?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  rounded?: boolean;
  /** Lấp đầy chiều cao khung cha thay vì giữ tỉ lệ 3:2 (ô lưới bento) */
  fill?: boolean;
};

/** Ảnh đại diện bài viết, tỉ lệ post-image-ratio (3 / 2). */
export function PostImage({
  src,
  alt = "",
  label,
  priority,
  sizes = "(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw",
  className = "",
  rounded = true,
  fill = false,
}: PostImageProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-paper-deep ${
        fill ? "h-full min-h-32" : "aspect-(--post-image-ratio)"
      } ${rounded ? "rounded-md" : ""} ${className}`}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]" />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex items-end p-s4"
        >
          {label ? (
            <span className="type-caption rounded-pill bg-paper/70 px-3 py-1 text-ink-soft">{label}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

type CoverSize = "sm" | "md" | "lg" | "xl";
const widths: Record<CoverSize, string> = {
  sm: "w-(--cover-size-sm)",
  md: "w-(--cover-size-md)",
  lg: "w-(--cover-size-lg)",
  xl: "w-(--cover-size-xl)",
};

/** Bìa sách tỉ lệ 2:3. Không có ảnh thì dùng ô giữ chỗ `book-cover-ph` kèm tên sách. */
export function BookCover({
  size = "md",
  src,
  title,
  tone = "deep",
  className = "",
  fluid,
}: {
  size?: CoverSize;
  src?: string;
  title?: string;
  tone?: "deep" | "ink" | "sunk";
  className?: string;
  fluid?: boolean;
}) {
  const toneCls =
    tone === "ink"
      ? "bg-accent text-on-accent"
      : tone === "sunk"
        ? "bg-paper-sunk text-ink"
        : "bg-paper-deep text-ink";
  return (
    <div
      className={`relative aspect-(--cover-ratio) shrink-0 overflow-hidden rounded-cover shadow-cover-shadow transition-transform duration-200 motion-reduce:transition-none ${
        fluid ? "w-full" : widths[size]
      } ${toneCls} ${className}`}
    >
      {src ? (
        <Image src={src} alt={title ? `Bìa sách ${title}` : ""} fill sizes="300px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-between p-[10%]" aria-hidden={!title}>
          <span className="block h-px w-1/3 bg-current opacity-40" />
          <span className="type-title line-clamp-4 text-[clamp(12px,9cqw,18px)] leading-tight">
            {title ?? "Bìa sách"}
          </span>
          <span className="block h-px w-1/2 bg-current opacity-40" />
        </div>
      )}
    </div>
  );
}
