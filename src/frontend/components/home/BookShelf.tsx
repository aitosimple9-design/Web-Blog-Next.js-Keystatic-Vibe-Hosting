// Tủ sách của mình: dải tối `inverse`, đáy nét cọ, thanh trượt bìa sách (mỗi bìa bấm sang chủ đề liên quan).
// Kiểu coverflow (Lộc chọn 2026-10-23): bìa GIỮA to nhất, hai bên nhỏ dần và nghiêng vào giữa; nút ‹ › chuyển từng cuốn.
// Đáy nét cọ; đỉnh cũng cắt nét cọ (brush-both) khi khối không đứng ngay sau Hero tối.
import { getUiLabels } from "@/shared/content/ui-labels";
import Link from "next/link";
import { getHomePage } from "@/shared/content/pages";
import { topicBySlug } from "@/shared/content/topics";
import { brushStyle, PULL_UP } from "@/frontend/lib/brush";
import { Reveal } from "@/frontend/components/ui/Reveal";
import { RevealText } from "@/frontend/components/ui/RevealText";
import { Slider } from "@/frontend/components/ui/Slider";
import { BookCover } from "@/frontend/components/ui/Media";
import { ArrowRightIcon } from "@/frontend/components/ui/Icon";

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
          <p className="type-label cf-label mt-s3 line-clamp-2">{b.title}</p>
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
        <p className="type-label cf-label mt-s3 line-clamp-2">{b.title}</p>
        <p className="type-caption cf-label mt-s1 inline-flex items-center gap-s1 text-on-inverse-soft">
          {topic.name}
          <ArrowRightIcon
            size={14}
            className="transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:group-hover:translate-x-1"
          />
        </p>
      </Link>
    );
  });

  return (
    <>
      <section
        aria-labelledby="shelf-title"
        className={`on-inverse ${pullUp ? "brush-bottom" : "brush-both"} ${PULL_UP} isolate z-10 bg-inverse pb-[calc(var(--brush-h)+var(--space-8))] text-on-inverse`}
        style={brushStyle}
      >
        <div className="wrap">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 id="shelf-title" className="type-display-lg text-balance">
              <RevealText text={shelf.title} />
            </h2>
            <p className="type-ui-body mx-auto mt-s4 max-w-lg text-pretty text-on-inverse-soft">
              {shelf.dek}
            </p>
          </Reveal>
          <Reveal className="mt-s7">
            <Slider
              label={getUiLabels().shelfList}
              items={items}
              coverflow
              gapClassName="gap-s3"
              trackClassName="px-[calc(50%-var(--cf-w)/2)] py-s6 [--cf-w:7rem] tablet:[--cf-w:8rem] desktop:[--cf-w:8.75rem]"
              itemClassName="w-(--cf-w)"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
