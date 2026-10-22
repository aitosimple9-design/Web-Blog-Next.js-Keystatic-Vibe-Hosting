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
import { SectionHead } from "@/frontend/components/ui/SectionHead";
import { Slider } from "@/frontend/components/ui/Slider";
import { subtopicHref } from "@/shared/blog-links";

function SubtopicCard({ sub, count, current }: { sub: Subtopic; count: number; current: boolean }) {
  return (
    <article
      className={`group lift surface-hover on-inverse relative isolate aspect-[3/4] w-full overflow-hidden rounded-lg bg-inverse text-on-inverse shadow-elevated-md ${
        current ? "outline-2 outline-offset-2 outline-accent" : ""
      }`}
    >
      {sub.image ? (
        <Image
          src={sub.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 200px, (min-width: 768px) 30vw, 44vw"
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
        {sub.description ? <p className="type-caption line-clamp-2 text-on-inverse">{sub.description}</p> : null}
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
    <section aria-labelledby="subtopics-title" className="mb-s6 tablet:mb-s7">
      <div className="mb-s6"><SectionHead id="subtopics-title" title={text.title} dek={text.dek} size="xl" /></div>
      {/* Khối thu hẹp hai bên (không tràn hết khung): 3 thẻ dọc cùng lúc, nút ‹ › nằm hai bên */}
      <div className="@container mx-auto max-w-[38rem]">
        <Slider
          label={getUiLabels().subtopicList}
          controls="sides"
          trackClassName="-my-8 py-8 [justify-content:safe_center]"
          itemClassName="w-[46cqw] tablet:w-[calc((100cqw-2*var(--space-4))/3)] [&>*]:h-full"
          items={subtopics.map((s) => (
            <SubtopicCard key={s.slug} sub={s} count={counts[s.slug] ?? 0} current={s.slug === currentSlug} />
          ))}
        />
      </div>
      {allHref ? (
        <div className="mt-s4 text-center">
          <Link href={allHref} className="type-ui-strong tap inline-flex items-center text-ink underline underline-offset-4">
            {text.allLabel}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
