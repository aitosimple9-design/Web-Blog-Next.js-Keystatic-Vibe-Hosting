// Hero Trang Book (/book) (dải tối `inverse`, đáy cắt nét cọ, họa tiết nền ở HeroBackdrop). Một CTA chính duy nhất: "Đọc bài mới nhất".
// 375: 1 cột (tiêu đề, ảnh 3:4 hẹp ≤ 22rem, chữ + CTA + icon, số liệu) · 768: 2 cột (ảnh 3:4 trái; chữ + số liệu phải) ·
// 1024+: 3 cột (chữ | ảnh | số liệu dọc), tiêu đề hai dòng đè lên mép trên ảnh.
// Chuyển động: tiêu đề hiện từng chữ, ảnh bung ra, chữ/CTA/số liệu nổi lên lần lượt (CSS, chạy ngay khi vẽ);
// ảnh nghiêng + các lớp trôi theo con trỏ; số liệu đếm lên khi cuộn tới (Motion.tsx).
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { formatDateLong } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { BookCover, PostImage } from "@/components/ui/Media";
import { ArrowRightIcon } from "@/components/ui/Icon";
import { CountUp, PointerLayer, PointerScene } from "@/components/ui/Motion";
import { SocialIcons } from "@/components/layout/SocialIcons";
import type { BookPageTexts } from "@/config/page-texts";

export function Hero({
  featured,
  stats,
  text,
}: {
  featured?: PostMeta;
  text: BookPageTexts["hero"];
  stats: { value: number; suffix?: string; label: string }[];
}) {
  const href = featured ? `/bai-viet/${featured.slug}` : "/blog";
  let w = 0;
  // Tiêu đề hai dòng từ admin; mỗi chữ trượt lên lần lượt
  const title = [text.titleLine1, text.titleLine2].map((l) => l.split(/\s+/).filter(Boolean));

  return (
    <div className="wrap grid gap-x-s6 gap-y-s5 pt-s5 pb-[calc(var(--brush-h)+var(--space-7))] tablet:grid-cols-2 tablet:pb-[calc(var(--brush-h)+var(--space-8))] desktop:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,220px)] desktop:gap-x-s6 desktop:pt-s7">
      {/* Tiêu đề: từng chữ trượt lên; đè lên mép trên ảnh từ 1024px */}
      <h1 className="type-display-xl relative z-10 text-balance tablet:col-span-2 desktop:col-span-2 desktop:col-start-1 desktop:row-start-1">
        {title.map((line, li) => (
          <span key={li} className={li === 0 ? "block desktop:block" : "block"}>
            {line.map((word) => (
              <span key={word} className="word-mask mr-[0.22em]">
                <span className="anim-word" style={{ "--i": w++ } as React.CSSProperties}>
                  {word}
                </span>
              </span>
            ))}
          </span>
        ))}
      </h1>

      {/* Bài nổi bật: ảnh nghệ thuật, nghiêng theo con trỏ */}
      <div
        className="anim-pop tablet:row-span-2 tablet:row-start-2 desktop:col-start-2 desktop:row-span-2 desktop:row-start-1 desktop:mt-s8"
        style={{ "--delay": "260ms" } as React.CSSProperties}
      >
        <PointerScene tilt={4} className="h-full">
        <article className="group relative mx-auto w-full max-w-[22rem] desktop:max-w-[21rem]">
          <PointerLayer depth={-6} className="h-full">
            <div className="aspect-[3/4] overflow-hidden rounded-md">
              <PostImage
                src={featured?.cover}
                seed={featured?.slug}
                fill
                priority
                sizes="(min-width: 1024px) 460px, (min-width: 768px) 50vw, 100vw"
                rounded={false}
                transitionName={featured ? `post-${featured.slug}` : undefined}
              />
            </div>
          </PointerLayer>

          {/* Bìa sách nổi lên phía trước ảnh */}
          {featured ? (
            <PointerLayer depth={16} className="pointer-events-none absolute top-s5 -right-2 hidden tablet:block desktop:-right-6">
              <BookCover size="sm" title={featured.source.book} seed={featured.source.book} className="rotate-6" />
            </PointerLayer>
          ) : null}

          <PointerLayer depth={10} className="absolute inset-x-s3 bottom-s3">
            <div className="flex items-center justify-between gap-s4 rounded-md surface-raised p-s4 text-ink">
              <div className="min-w-0">
                <p className="type-eyebrow uppercase text-ink-faint">{text.featuredEyebrow}</p>
                <h2 className="type-title mt-s1 line-clamp-2 text-balance">
                  <Link href={href} className="no-underline after:absolute after:inset-0">
                    <span className="ul-grow">{featured?.title ?? text.featuredFallback}</span>
                  </Link>
                </h2>
                {featured ? (
                  <p className="type-caption mt-s1 text-ink-faint">{formatDateLong(featured.date)}</p>
                ) : null}
              </div>
              <ArrowRightIcon
                size={20}
                className="shrink-0 transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:group-hover:translate-x-2"
              />
            </div>
          </PointerLayer>
        </article>
        </PointerScene>
      </div>

      {/* Chữ + CTA + theo dõi */}
      <div className="tablet:col-start-2 tablet:row-start-2 desktop:col-start-1 desktop:row-start-2 desktop:self-start">
        <p className="type-dek anim-fade-rise text-on-inverse-soft" style={{ "--delay": "520ms" } as React.CSSProperties}>
          {text.dek}
        </p>
        <div className="anim-fade-rise" style={{ "--delay": "640ms" } as React.CSSProperties}>
          <Button href={href} variant="on-inverse" className="mt-s5 w-full tablet:w-auto">
            {text.ctaLabel}
            <ArrowRightIcon />
          </Button>
        </div>
        <div className="anim-fade-rise mt-s5" style={{ "--delay": "760ms" } as React.CSSProperties}>
          <p className="type-caption text-on-inverse-soft">{text.followLabel}</p>
          <SocialIcons featured="zalo" onDark className="mt-s3" />
        </div>
      </div>

      {/* Số liệu: đếm lên khi cuộn tới */}
      <dl
        className="anim-fade-rise grid grid-cols-3 divide-x divide-on-inverse/20 text-center tablet:col-start-2 tablet:row-start-3 tablet:text-left desktop:col-start-3 desktop:row-span-2 desktop:row-start-1 desktop:mt-s8 desktop:grid-cols-1 desktop:divide-x-0 desktop:divide-y desktop:self-center [&>div]:px-s2 tablet:[&>div]:px-s4 tablet:[&>div:first-child]:pl-0 desktop:[&>div]:px-0 desktop:[&>div]:py-s5"
        style={{ "--delay": "880ms" } as React.CSSProperties}
      >
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="type-display-md tabular-nums">
              <CountUp to={s.value} suffix={s.suffix} />
            </dd>
            <dt className="type-caption text-on-inverse-soft">{s.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
