// Thanh trượt chủ đề (dải paper). 375: 1 thẻ lộ mép thẻ kế · 768: ~2,5 thẻ · 1024+: 4 thẻ nguyên vẹn, ‹ › xem thẻ thứ 5.
import Link from "next/link";
import type { Topic } from "@/config/topics";
import { Slider } from "@/components/ui/Slider";
import { ArrowRightIcon } from "@/components/ui/Icon";

function TopicCard({ topic, index, count }: { topic: Topic; index: number; count: number }) {
  return (
    <article className="group relative flex h-full flex-col items-center rounded-lg border-(length:--border-width) border-rule bg-paper-raised p-s5 text-center transition-transform duration-200 motion-safe:hover:-translate-y-1">
      <span
        aria-hidden
        className="type-title grid size-12 place-items-center rounded-pill bg-accent-soft text-accent-soft-ink tabular-nums"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="type-display-sm mt-s4">{topic.name}</h3>
      <p className="type-excerpt mt-s2 line-clamp-2 text-ink-soft">{topic.description}</p>
      <p className="type-caption mt-s3 text-ink-faint">{count} bài</p>
      <Link
        href={`/blog/${topic.slug}`}
        className="type-button tap mt-auto inline-flex items-center justify-center gap-s2 self-stretch rounded-sm bg-accent px-(--button-pad-x) text-on-accent no-underline transition-colors duration-(--motion-fast) after:absolute after:inset-0 hover:bg-accent-strong"
        style={{ marginTop: "var(--space-5)" }}
      >
        Xem bài <span className="sr-only-x">chủ đề {topic.name}</span>
        <ArrowRightIcon className="transition-transform duration-200 motion-safe:group-hover:translate-x-1" />
      </Link>
    </article>
  );
}

export function TopicSlider({ topics, counts }: { topics: Topic[]; counts: Record<string, number> }) {
  return (
    <section aria-labelledby="topics-title" className="bg-paper text-ink">
      <div className="wrap band-y">
        <div className="max-w-2xl">
          <h2 id="topics-title" className="type-display-md">
            Chủ đề
          </h2>
          <p className="type-dek mt-s3 text-ink-soft">
            Chọn một chủ đề để đọc các bài ghi chép liên quan. Vuốt ngang để xem thêm.
          </p>
        </div>
        <div className="@container mt-s6">
          <Slider
            label="Danh sách chủ đề"
            trackClassName="bleed desktop:bleed-none pb-1"
            itemClassName="w-[86cqw] tablet:w-[calc((100cqw-2*var(--space-4))/2.5)] desktop:w-[calc((100cqw-3*var(--space-4))/4)] [&>*]:h-full"
            items={topics.map((t, i) => (
              <TopicCard key={t.slug} topic={t} index={i} count={counts[t.slug] ?? 0} />
            ))}
          />
        </div>
      </div>
    </section>
  );
}
