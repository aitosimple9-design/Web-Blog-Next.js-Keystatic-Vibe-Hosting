// Thanh trượt chủ đề (dải paper hoặc paper-sunk theo vị trí khối). Thẻ tỉ lệ 3:4, ảnh nền, khung chữ nền đặc, nổi bằng elevated-*. 375: 1 thẻ lộ mép thẻ kế · 768: ~2,5 thẻ · 1024+: 4 thẻ nguyên vẹn, ‹ › xem thẻ thứ 5.
import type { BookPageTexts } from "@/shared/config/page-texts";
import Image from "next/image";
import Link from "next/link";
import type { Topic } from "@/shared/content/topics";
import { SectionHead } from "@/frontend/components/ui/SectionHead";
import { toneBg, type SectionTone } from "@/frontend/lib/brush";
import { Slider } from "@/frontend/components/ui/Slider";
import { ArrowRightIcon } from "@/frontend/components/ui/Icon";

function TopicCard({
  topic,
  index,
  count,
}: {
  topic: Topic;
  index: number;
  count: number;
}) {
  return (
    <article className="group lift surface-hover on-inverse relative isolate aspect-[3/4] w-full overflow-hidden rounded-lg bg-inverse text-on-inverse shadow-elevated-lg">
      {/* Ảnh tràn cả thẻ; lớp phủ `inverse` 65% (một màu phẳng, không gradient) để chữ đọc rõ, nhạt đi khi hover */}
      <Image
        src={topic.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 280px, (min-width: 768px) 40vw, 86vw"
        className="-z-20 object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.06]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-inverse/65 transition-opacity duration-(--motion-normal) ease-(--ease-smooth) group-hover:opacity-80"
      />
      <span
        aria-hidden
        className="type-title absolute top-s4 left-s4 grid size-12 place-items-center rounded-pill bg-paper-raised text-ink tabular-nums shadow-elevated-sm transition-[background-color,color,transform] duration-(--motion-normal) ease-(--ease-smooth) group-hover:scale-110 group-hover:bg-accent group-hover:text-on-accent motion-reduce:group-hover:scale-100"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="absolute inset-x-s5 bottom-s5 flex flex-col gap-s4">
        <div className="flex items-center justify-between gap-s3">
          <h3 className="type-display-sm">{topic.name}</h3>
          <p className="type-caption inline-flex shrink-0 items-baseline gap-1 rounded-pill border-(length:--border-width) border-on-inverse-soft/60 bg-on-inverse/15 px-s3 py-1 text-on-inverse">
            <span className="type-ui-strong tabular-nums">{count}</span>
            bài
          </p>
        </div>
        <p className="type-excerpt line-clamp-2 text-on-inverse">
          {topic.description}
        </p>
        <Link
          href={`/blog/${topic.slug}`}
          className="type-button tap inline-flex items-center justify-center gap-s2 rounded-sm bg-on-inverse px-(--button-pad-x) text-inverse no-underline shadow-elevated-sm transition-[color,filter,box-shadow] duration-(--motion-fast) after:absolute after:inset-0 hover:shadow-elevated-md hover:brightness-95"
        >
          Xem bài <span className="sr-only-x">chủ đề {topic.name}</span>
          <ArrowRightIcon className="transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:group-hover:translate-x-2" />
        </Link>
      </div>
    </article>
  );
}

export function TopicSlider({
  topics,
  counts,
  text,
  tone = "paper",
  pullUp = false,
}: {
  topics: Topic[];
  counts: Record<string, number>;
  text: BookPageTexts["topics"];
  tone?: SectionTone;
  pullUp?: boolean;
}) {
  return (
    <section aria-labelledby="topics-title" className={`${toneBg(tone)} ${pullUp ? "relative -mt-[clamp(40px,5.5vw,64px)] pt-[clamp(40px,5.5vw,64px)]" : ""} text-ink`}>
      <div className="wrap band-y">
        <SectionHead id="topics-title" title={text.title} dek={text.dek} />
        <div className="@container mt-s6">
          <Slider
            label="Danh sách chủ đề"
            trackClassName="bleed desktop:-ml-4 desktop:-mr-2 desktop:pl-4 desktop:pr-2 desktop:scroll-px-4 -mb-24 pt-3 pb-32"
            itemClassName="w-[86cqw] tablet:w-[calc((100cqw-2*var(--space-4))/2.5)] desktop:w-[calc((100cqw-3*var(--space-4))/4)] [&>*]:h-full"
            items={topics.map((t, i) => (
              <TopicCard
                key={t.slug}
                topic={t}
                index={i}
                count={counts[t.slug] ?? 0}
              />
            ))}
          />
        </div>
      </div>
    </section>
  );
}
