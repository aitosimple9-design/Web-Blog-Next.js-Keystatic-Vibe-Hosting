// Tủ sách của mình: dải tối `inverse`, đáy nét cọ, thanh trượt bìa sách (mỗi bìa bấm sang chủ đề liên quan).
// 375: ~2,3 bìa · 768: ~4,4 bìa · 1024+: 5 bìa, nút ‹ › trượt tới bìa thứ 6.
import Link from "next/link";
import { getHomePage } from "@/lib/pages";
import { topicBySlug } from "@/lib/topics";
import { brushStyle, PULL_UP } from "@/lib/brush";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { Slider } from "@/components/ui/Slider";
import { BookCover } from "@/components/ui/Media";
import { ArrowRightIcon } from "@/components/ui/Icon";

export function BookShelf({ pullUp = false }: { pullUp?: boolean }) {
  const { shelf } = getHomePage();
  if (shelf.books.length === 0) return null;
  const items = shelf.books.map((b) => {
    const topic = topicBySlug(b.topic);
    // Chủ đề của sách này không (còn) có trong content/topics: hiện bìa + tên nhưng KHÔNG làm liên kết, tránh dẫn tới trang 404 và nhãn trống
    if (!topic) {
      return (
        <div key={b.title}>
          <BookCover fluid title={b.title} seed={b.title} />
          <p className="type-label mt-s3 line-clamp-2">{b.title}</p>
        </div>
      );
    }
    return (
      <Link
        key={b.title}
        href={`/blog/${b.topic}`}
        className="group lift block no-underline"
        aria-label={`${b.title}, xem bài cùng chủ đề ${topic.name}`}
      >
        <BookCover fluid title={b.title} seed={b.title} />
        <p className="type-label mt-s3 line-clamp-2">{b.title}</p>
        <p className="type-caption mt-s1 inline-flex items-center gap-s1 text-on-inverse-soft">
          {topic.name}
          <ArrowRightIcon size={14} className="transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:group-hover:translate-x-1" />
        </p>
      </Link>
    );
  });

  return (
    <section
      aria-labelledby="shelf-title"
      className={`on-inverse brush-bottom relative isolate z-10 bg-inverse pb-[calc(var(--brush-h)+var(--space-8))] text-on-inverse ${
        pullUp ? PULL_UP : "pt-s8 tablet:pt-s9"
      }`}
      style={brushStyle}
    >
      <div className="wrap">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 id="shelf-title" className="type-display-lg text-balance">
            <RevealText text={shelf.title} />
          </h2>
          <p className="type-ui-body mx-auto mt-s4 max-w-lg text-pretty text-on-inverse-soft">{shelf.dek}</p>
        </Reveal>
        <Reveal className="mt-s7">
          <Slider
            label="Tủ sách"
            items={items}
            trackClassName="pb-s4 pl-1 pt-s2"
            itemClassName="w-[calc((100%-var(--space-4))/2.3)] tablet:w-[calc((100%-3*var(--space-4))/4.4)] desktop:w-[calc((100%-4*var(--space-4))/5)]"
          />
        </Reveal>
      </div>
    </section>
  );
}
