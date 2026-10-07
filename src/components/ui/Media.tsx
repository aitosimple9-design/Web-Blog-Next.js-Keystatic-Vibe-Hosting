// Ảnh bài (3:2, radius-md) và bìa sách (2:3, radius-cover, cover-shadow — đổ bóng DUY NHẤT của hệ thống).
// Chưa có ảnh thật thì dùng "ảnh bìa nghệ thuật" sinh từ seed (CoverArt): hình học đơn sắc, mỗi bài một hình riêng.
// Luôn có tỉ lệ cố định để trang không nhảy khi ảnh tải. `transitionName` cho phép ảnh "bay" từ thẻ sang trang bài.
import Image from "next/image";
import { ViewTransition } from "react";
import { bookCovers } from "@/config/covers";
import { CoverArt } from "@/components/ui/CoverArt";
import { ScrollParallax } from "@/components/ui/Motion";

type PostImageProps = {
  src?: string;
  alt?: string;
  /** Chuỗi sinh ảnh nghệ thuật khi chưa có ảnh thật (thường là slug bài) */
  seed?: string;
  label?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  rounded?: boolean;
  /** Không đổ bóng riêng (khi ảnh nằm trong thẻ đã có bóng) */
  flat?: boolean;
  /** Lấp đầy chiều cao khung cha thay vì giữ tỉ lệ 3:2 (ô lưới bento) */
  fill?: boolean;
  /** Tên View Transition để ảnh morph giữa thẻ và trang bài (vd: `post-<slug>`) */
  transitionName?: string;
  /** Ảnh trôi chậm hơn nội dung khi cuộn (dùng cho ảnh bìa lớn ở trang bài) */
  parallax?: boolean;
};

/** Ảnh đại diện bài viết, tỉ lệ post-image-ratio (3 / 2). */
export function PostImage({
  src,
  alt = "",
  seed = "mac-dinh",
  label,
  priority,
  sizes = "(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw",
  className = "",
  rounded = true,
  flat = false,
  fill = false,
  transitionName,
  parallax = false,
}: PostImageProps) {
  const art = (
    <div className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform motion-safe:group-hover:scale-[1.05]">
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <CoverArt seed={seed} orientation="wide" />
      )}
    </div>
  );
  const box = (
    <div
      className={`relative w-full overflow-hidden bg-paper-deep ${
        fill ? "h-full min-h-32" : "aspect-(--post-image-ratio)"
      } ${rounded ? (flat ? "rounded-md" : "rounded-md img-elevated") : ""} ${className}`}
    >
      {parallax ? <ScrollParallax className="absolute inset-0">{art}</ScrollParallax> : art}
      {!src && label ? (
        <span className="type-caption absolute bottom-s3 left-s3 rounded-pill bg-paper-raised px-3 py-1 text-ink-soft">
          {label}
        </span>
      ) : null}
    </div>
  );
  return transitionName ? <ViewTransition name={transitionName}>{box}</ViewTransition> : box;
}

type CoverSize = "sm" | "md" | "lg" | "xl";
const widths: Record<CoverSize, string> = {
  sm: "w-(--cover-size-sm)",
  md: "w-(--cover-size-md)",
  lg: "w-(--cover-size-lg)",
  xl: "w-(--cover-size-xl)",
};

/** Bìa sách tỉ lệ 2:3 (đổ bóng duy nhất của hệ thống). Không có ảnh: ảnh nghệ thuật + nhãn tên sách. */
export function BookCover({
  size = "md",
  src,
  title,
  seed,
  className = "",
  fluid,
}: {
  size?: CoverSize;
  src?: string;
  title?: string;
  seed?: string;
  className?: string;
  fluid?: boolean;
  /** (giữ để tương thích) */
  tone?: "deep" | "ink" | "sunk";
}) {
  // Có ảnh bìa (truyền vào hoặc bìa demo theo tên sách) thì dùng ảnh; không thì CoverArt sinh tự động
  const cover = src ?? (title ? bookCovers[title] : undefined);
  return (
    <div
      className={`relative aspect-(--cover-ratio) shrink-0 overflow-hidden rounded-cover bg-paper-deep text-ink shadow-cover-shadow ${
        fluid ? "w-full" : widths[size]
      } ${className}`}
    >
      {cover ? (
        <Image
          src={cover}
          alt={title ? `Bìa sách ${title}` : ""}
          fill
          sizes="300px"
          unoptimized={cover.endsWith(".svg")}
          className="object-cover"
        />
      ) : (
        <>
          <CoverArt seed={seed ?? title ?? "bia"} orientation="tall" />
          {title ? (
            <span className="type-caption absolute inset-x-[8%] bottom-[7%] line-clamp-2 rounded-cover bg-paper-raised px-[7%] py-[5%] leading-tight font-semibold text-ink">
              {title}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
