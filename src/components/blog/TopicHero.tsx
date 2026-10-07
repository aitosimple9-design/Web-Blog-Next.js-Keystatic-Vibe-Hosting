// Hero chủ đề trên dải tối (inverse). 375: căn giữa · 768: căn giữa, tiêu đề lớn hơn, số liệu trong thẻ ·
// 1024+: chữ + CTA trái, bìa giữa, danh sách chủ đề dọc bên phải, số liệu một hàng bên dưới.
import Link from "next/link";
import type { Topic } from "@/config/topics";
import { Button } from "@/components/ui/Button";
import { BookCover } from "@/components/ui/Media";
import { ArrowRightIcon } from "@/components/ui/Icon";

type Stat = { value: number; label: string };

export function TopicHero({
  topic,
  topics,
  counts,
  stats,
  books,
  latestHref,
}: {
  topic: Topic;
  topics: Topic[];
  counts: Record<string, number>;
  stats: Stat[];
  books: string[];
  latestHref?: string;
}) {
  const [b1, b2, b3] = [books[0], books[1] ?? books[0], books[2] ?? books[0]];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-s6 pt-s6 pb-s8 text-center desktop:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px] desktop:items-center desktop:gap-x-s7 desktop:pt-s6 desktop:text-left">
      {/* Chữ + CTA */}
      <div className="mx-auto max-w-xl desktop:mx-0 desktop:max-w-none">
        <p className="type-eyebrow inline-block rounded-pill border-(length:--border-width) border-on-inverse-soft px-s4 py-s1 uppercase text-on-inverse-soft tablet:py-s2">
          Chủ đề
        </p>
        <h2 className="type-display-lg mt-s4 text-balance text-on-inverse">{topic.name}</h2>
        <p className="type-dek mt-s3 text-on-inverse-soft">{topic.description}</p>
        {latestHref ? (
          <Button href={latestHref} variant="on-inverse" className="mt-s5">
            Đọc bài mới nhất
            <ArrowRightIcon />
          </Button>
        ) : null}
      </div>

      {/* Bìa sách: ba cuốn xếp chồng nhẹ, cuốn giữa nổi lên */}
      <div aria-hidden className="relative mx-auto flex h-56 w-full max-w-md items-center justify-center tablet:h-72">
        <div className="absolute top-1/2 left-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-on-inverse/10 tablet:size-60" />
        <BookCover title={b2} tone="sunk" className="relative -mr-7 w-24! -rotate-6 opacity-90 tablet:-mr-9 tablet:w-28!" />
        <BookCover title={b1} tone="deep" className="relative z-10 w-32! tablet:w-44!" />
        <BookCover title={b3} tone="ink" className="relative -ml-7 w-24! rotate-6 opacity-90 tablet:-ml-9 tablet:w-28!" />
      </div>

      {/* Danh sách chủ đề dọc (từ 1024px) */}
      <nav aria-label="Chủ đề" className="hidden desktop:block">
        <div className="mb-s3 flex items-baseline justify-between border-b-(length:--border-width) border-on-inverse-soft/40 pb-s3">
          <p className="type-eyebrow uppercase text-on-inverse-soft">Chủ đề</p>
          <p className="type-caption text-on-inverse-soft">{topics.length} mục</p>
        </div>
        <ol>
          {topics.map((t, i) => {
            const active = t.slug === topic.slug;
            return (
              <li key={t.slug}>
                <Link
                  href={`/blog/${t.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`group tap relative flex items-center gap-s3 rounded-sm px-s3 py-s2 no-underline transition-colors duration-(--motion-fast) hover:bg-on-inverse/10 ${
                    active ? "text-on-inverse" : "text-on-inverse-soft hover:text-on-inverse"
                  }`}
                >
                  {active ? <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-pill bg-on-inverse" /> : null}
                  <span className="type-caption w-6 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="type-ui-strong block">{t.name}</span>
                    <span className="type-caption block opacity-80">{counts[t.slug] ?? 0} bài</span>
                  </span>
                  <ArrowRightIcon className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100" />
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Số liệu */}
      <dl className="mx-auto grid w-full max-w-md grid-cols-3 divide-x divide-on-inverse-soft/30 rounded-md bg-on-inverse/10 py-s4 tablet:max-w-xl desktop:col-span-2 desktop:mx-0 desktop:max-w-none desktop:bg-transparent desktop:py-0 desktop:text-left desktop:[&>div]:px-s6 desktop:[&>div:first-child]:pl-0">
        {stats.map((s) => (
          <div key={s.label} className="px-s2">
            <dd className="type-display-md tabular-nums text-on-inverse">{s.value}</dd>
            <dt className="type-caption text-on-inverse-soft">{s.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
