// Hero Trang chủ (dải paper-sunk). Một CTA chính duy nhất: "Đọc bài mới nhất".
// 375: 1 cột (tiêu đề, ảnh vuông, chữ + CTA + icon, số liệu) · 768: 2 cột (ảnh 4:5 trái; chữ + số liệu phải) ·
// 1024+: 3 cột (chữ | ảnh | số liệu dọc), tiêu đề hai dòng đè lên mép trên ảnh.
import Link from "next/link";
import { topicBySlug } from "@/config/topics";
import type { PostMeta } from "@/lib/posts";
import { formatDateLong } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { PostImage } from "@/components/ui/Media";
import { ArrowRightIcon } from "@/components/ui/Icon";
import { SocialIcons } from "@/components/layout/SocialIcons";

export function Hero({
  featured,
  stats,
}: {
  featured?: PostMeta;
  stats: { value: string; label: string }[];
}) {
  const topic = featured ? topicBySlug(featured.category)?.name : undefined;
  const href = featured ? `/bai-viet/${featured.slug}` : "/blog";

  return (
    <div className="wrap grid gap-x-s6 gap-y-s5 pt-s5 pb-s7 tablet:grid-cols-2 tablet:pb-s9 desktop:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,220px)] desktop:gap-x-s6 desktop:pt-s7">
      {/* Tiêu đề: đè lên mép trên ảnh từ 1024px */}
      <h1 className="type-display-xl relative z-10 text-balance tablet:col-span-2 desktop:col-span-2 desktop:col-start-1 desktop:row-start-1">
        Điều đọng lại <br className="hidden desktop:block" />
        sau mỗi cuốn sách
      </h1>

      {/* Bài nổi bật */}
      <article className="group relative tablet:row-span-2 tablet:row-start-2 desktop:col-start-2 desktop:row-span-2 desktop:row-start-1 desktop:mt-s8">
        <div className="aspect-square overflow-hidden rounded-md tablet:aspect-[4/5] desktop:aspect-auto desktop:h-full desktop:min-h-[420px]">
          <PostImage
            src={featured?.cover}
            label={topic}
            fill
            priority
            sizes="(min-width: 1024px) 460px, (min-width: 768px) 50vw, 100vw"
            rounded={false}
          />
        </div>
        <div className="absolute inset-x-s3 bottom-s3 flex items-center justify-between gap-s4 rounded-md bg-paper-raised p-s4 text-ink">
          <div className="min-w-0">
            <p className="type-eyebrow uppercase text-ink-faint">Bài nổi bật</p>
            <h2 className="type-title mt-s1 line-clamp-2 text-balance">
              <Link href={href} className="no-underline after:absolute after:inset-0">
                {featured?.title ?? "Xem tất cả bài viết"}
              </Link>
            </h2>
            {featured ? (
              <p className="type-caption mt-s1 text-ink-faint">{formatDateLong(featured.date)}</p>
            ) : null}
          </div>
          <ArrowRightIcon
            size={20}
            className="shrink-0 transition-transform duration-200 motion-safe:group-hover:translate-x-1"
          />
        </div>
      </article>

      {/* Chữ + CTA + theo dõi */}
      <div className="tablet:col-start-2 tablet:row-start-2 desktop:col-start-1 desktop:row-start-2 desktop:self-start">
        <p className="type-dek text-ink-soft">
          Mỗi bài ghi chép một cuốn sách: ý chính, ví dụ và cách áp dụng.
        </p>
        <Button href={href} className="mt-s5 w-full tablet:w-auto">
          Đọc bài mới nhất
          <ArrowRightIcon />
        </Button>
        <div className="mt-s5">
          <p className="type-caption text-ink-faint">Theo dõi</p>
          <SocialIcons className="mt-s2 -ml-1" />
        </div>
      </div>

      {/* Số liệu */}
      <dl className="grid grid-cols-3 divide-x divide-rule-strong/40 text-center tablet:col-start-2 tablet:row-start-3 tablet:text-left desktop:col-start-3 desktop:row-span-2 desktop:row-start-1 desktop:mt-s8 desktop:grid-cols-1 desktop:divide-x-0 desktop:divide-y desktop:self-center [&>div]:px-s2 tablet:[&>div]:px-s4 tablet:[&>div:first-child]:pl-0 desktop:[&>div]:px-0 desktop:[&>div]:py-s5">
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="type-display-md tabular-nums">{s.value}</dd>
            <dt className="type-caption text-ink-faint">{s.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
