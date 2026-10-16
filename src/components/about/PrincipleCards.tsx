// Khối "Cách mình đọc": 4 thẻ nguyên tắc đánh số (cùng ngôn ngữ với mục lục trang bài).
// 375: 1 cột · 768: lưới 2x2 · 1024+: 4 thẻ một hàng. Thẻ nhấc lên khi rê chuột (chỉ trên thiết bị có chuột).
import { getHomePage } from "@/lib/pages";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

export function PrincipleCards() {
  const { principles } = getHomePage();
  return (
    <section aria-labelledby="principles-title" className="bg-paper-sunk py-s8 text-ink tablet:py-s9">
      <div className="wrap">
        <SectionHead id="principles-title" title={principles.title} dek={principles.dek} />
        <ol className="mt-s7 grid gap-s4 tablet:grid-cols-2 desktop:grid-cols-4">
          {principles.items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i * 0.08} className="h-full">
              <div className="lift surface-hover surface-raised h-full rounded-md p-s5 shadow-elevated-md">
                <span aria-hidden className="type-display-md tabular-nums text-accent-warm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="type-title mt-s3">{it.title}</h3>
                <p className="type-ui-body mt-s2 text-ink-soft">{it.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
