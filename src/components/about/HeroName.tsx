// Tên khổng lồ nằm SAU chân dung (ý tưởng bìa tạp chí): hai hàng, mỗi hàng hai chữ, chừa khoảng giữa cho đầu / vai người.
// Từ 768px: khoảng giữa mỗi hàng rộng bằng đầu / vai người; dưới 768px người nhỏ nên tên xếp nguyên chữ phía trên (không bị che).
// Hàng 1 chữ đặc, hàng 2 chỉ có nét viền; từng chữ cái trượt lên từ sau mặt nạ (CSS `anim-word`, một lần).
// Là `h1` thật cho SEO / trình đọc màn hình: `aria-label` đọc nguyên tên, các chữ cái rời đặt `aria-hidden`.
import type { CSSProperties } from "react";

type Row = { words: [string, string]; gap: string; outline?: boolean; startIndex: number };

function Letters({ word, from }: { word: string; from: number }) {
  return (
    <span aria-hidden className="inline-block whitespace-nowrap">
      {[...word].map((ch, i) => (
        // mặt nạ chừa chỗ cho dấu tiếng Việt cao (Ầ, Ọ) ở trên và chân chữ ở dưới
        <span key={i} className="inline-block overflow-hidden -mt-[0.3em] -mb-[0.1em] pt-[0.3em] pb-[0.1em] align-top">
          <span className="anim-word" style={{ "--delay": "650ms", "--i": from + i } as CSSProperties}>
            {ch}
          </span>
        </span>
      ))}
    </span>
  );
}

export function HeroName({ name, className = "" }: { name: string; className?: string }) {
  // Tên 4 chữ chia thành 2 hàng, mỗi hàng 2 chữ (đổi tên khác 4 chữ thì sửa ở đây)
  const [a, b, c, d] = name.split(" ");
  const rows: Row[] = [
    { words: [a, b], gap: "calc(var(--pw) * 0.56)", startIndex: 0 },
    { words: [c, d], gap: "calc(var(--pw) * 0.86)", outline: true, startIndex: a.length + b.length },
  ];
  return (
    <h1
      aria-label={name}
      className={`type-display-xl block font-semibold uppercase leading-[1.04] tracking-tight text-on-inverse text-[min(calc(var(--pw)*0.27),15vw)] tablet:text-[min(calc(var(--pw)*0.16),7.4vw)] ${className}`}
    >
      {rows.map((r) => (
        <span
          key={r.words.join()}
          className={`flex justify-center gap-[0.3em] tablet:grid tablet:grid-cols-[minmax(0,1fr)_var(--g)_minmax(0,1fr)] tablet:gap-0 ${r.outline ? "text-transparent [-webkit-text-stroke:1.5px_var(--on-inverse)]" : ""}`}
          style={{ "--g": r.gap } as CSSProperties}
        >
          <span className="text-right">
            <Letters word={r.words[0]} from={r.startIndex} />
          </span>
          <span aria-hidden className="hidden tablet:block" />
          <span className="text-left">
            <Letters word={r.words[1]} from={r.startIndex + r.words[0].length} />
          </span>
        </span>
      ))}
    </h1>
  );
}
