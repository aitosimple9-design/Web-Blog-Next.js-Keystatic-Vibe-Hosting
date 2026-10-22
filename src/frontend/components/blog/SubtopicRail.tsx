// Khối CHỦ ĐỀ CON ở trang Blog (nằm trên danh sách bài của chủ đề): thanh trượt 5 thẻ cùng lúc từ 1024px, nút ‹ › nổi ở giữa hai bên khối.
// Thẻ theo ngôn ngữ của thẻ chủ đề (ảnh tràn phủ `inverse` 65%, chữ trên ảnh); chủ đề con không có ảnh thì dùng CoverArt.
// 375: 2,2 thẻ (lộ mép thẻ kế) · 768: ~3,3 thẻ · 1024+: 5 thẻ nguyên vẹn. Mỗi thẻ là MỘT liên kết tới /blog/<chủ đề>/<chủ đề con>.
import Image from "next/image";
import Link from "next/link";
import type { BlogPageTexts } from "@/shared/config/page-texts";
import { fillLabel } from "@/shared/config/ui-labels";
import { getUiLabels } from "@/shared/content/ui-labels";
import type { Subtopic } from "@/shared/content/subtopics";
import { CoverArt } from "@/frontend/components/ui/CoverArt";
import { Slider } from "@/frontend/components/ui/Slider";
import { subtopicHref } from "@/shared/blog-links";

function SubtopicCard({ sub, count, current }: { sub: Subtopic; count: number; current: boolean }) {
  return (
    <article
      className={`group lift surface-hover on-inverse relative isolate aspect-[4/5] w-full overflow-hidden rounded-lg bg-inverse text-on-inverse shadow-elevated-md ${
        current ? "outline-2 outline-offset-2 outline-accent" : ""
      }`}
    >
      {sub.image ? (
        <Image
          src={sub.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 224px, (min-width: 768px) 30vw, 44vw"
          className="-z-20 object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.06]"
        />
      ) : (
        <CoverArt seed={sub.slug} orientation="tall" className="absolute inset-0 -z-20 size-full object-cover" />
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-inverse/65 transition-opacity duration-(--motion-normal) ease-(--ease-smooth) group-hover:opacity-80" />
      <div className="absolute inset-x-s4 bottom-s4 flex flex-col gap-s2">
        <p className="type-caption inline-flex w-fit shrink-0 items-baseline gap-1 rounded-pill border-(length:--border-width) border-on-inverse-soft/60 bg-on-inverse/15 px-s3 py-1 text-on-inverse" aria-hidden>
          <span className="type-ui-strong tabular-nums">{count}</span>
          bài
        </p>
        <h3 className="type-title text-balance">
          <Link
            href={subtopicHref(sub.topic, sub.slug)}
            aria-current={current ? "page" : undefined}
            className="text-on-inverse no-underline after:absolute after:inset-0"
          >
            {sub.name}
            <span className="sr-only"> ({fillLabel(getUiLabels().subtopicPosts, { n: String(count) })})</span>
          </Link>
        </h3>
      </div>
    </article>
  );
}

export function SubtopicRail({
  subtopics,
  counts,
  text,
  currentSlug,
  allHref,
}: {
  subtopics: Subtopic[];
  counts: Record<string, number>;
  text: BlogPageTexts["subtopics"];
  /** Chủ đề con đang xem (trang chủ đề con) */
  currentSlug?: string;
  /** Có thì hiện nút quay về cả chủ đề (chỉ ở trang chủ đề con) */
  allHref?: string;
}) {
  return (
    <section aria-labelledby="subtopics-title" className="mb-s7 tablet:mb-s8">
      <div className="mb-s5 flex flex-wrap items-end justify-between gap-x-s5 gap-y-s2">
        <div>
          <h2 id="subtopics-title" className="type-display-sm text-balance">
            {text.title}
          </h2>
          {text.dek ? <p className="type-excerpt mt-s1 text-ink-soft">{text.dek}</p> : null}
        </div>
        {allHref ? (
          <Link href={allHref} className="type-ui-strong tap inline-flex items-center text-ink underline underline-offset-4">
            {text.allLabel}
          </Link>
        ) : null}
      </div>
      <div className="@container">
        <Slider
          label={getUiLabels().subtopicList}
          controls="sides"
          trackClassName="-my-8 py-8"
          itemClassName="w-[44cqw] tablet:w-[calc((100cqw-2*var(--space-4))/3.3)] desktop:w-[calc((100cqw-4*var(--space-4))/5)] [&>*]:h-full"
          items={subtopics.map((s) => (
            <SubtopicCard key={s.slug} sub={s} count={counts[s.slug] ?? 0} current={s.slug === currentSlug} />
          ))}
        />
      </div>
    </section>
  );
}
