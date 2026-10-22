// Tiêu đề mục căn giữa: tiêu đề, dek, rồi đường kẻ ngang có họa tiết hình thoi ở giữa (cùng ngôn ngữ với dải chữ trang chủ).
// Họa tiết chỉ trang trí (aria-hidden), chỉ dùng token màu; hai đường kẻ mở rộng ra hai bên khi mục vào màn hình.
import { Reveal } from "@/frontend/components/ui/Reveal";
import { RevealText } from "@/frontend/components/ui/RevealText";

/** `left`: họa tiết ở đầu trái, đường kẻ chạy hết bề ngang (dùng khi tiêu đề căn trái, vd. trang Blog) */
export function Ornament({ align = "center" }: { align?: "center" | "left" }) {
  if (align === "left") {
    return (
      <div aria-hidden className="mt-s4 flex w-full items-center gap-s3">
        <svg
          width="132"
          height="35"
          viewBox="0 0 76 20"
          className="shrink-0 text-accent-warm"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        >
          <path d="M2 10h14M60 10h14" strokeLinecap="round" />
          <path d="M24 10l4-4 4 4-4 4z" fill="currentColor" stroke="none" />
          <path d="M44 10l4-4 4 4-4 4z" fill="currentColor" stroke="none" />
          <path d="M38 1.5 46.5 10 38 18.5 29.5 10z" />
          <path
            d="M38 6.5 41.5 10 38 13.5 34.5 10z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
        <span className="relative h-px flex-1 bg-rule-strong">
          <span className="absolute top-1/2 right-0 size-1 -translate-y-1/2 rotate-45 bg-accent-warm" />
        </span>
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="mx-auto mt-s5 flex w-full max-w-md items-center gap-s3 tablet:max-w-lg"
    >
      <span className="relative h-px flex-1 bg-rule-strong">
        <span className="absolute top-1/2 right-0 size-1 -translate-y-1/2 rotate-45 bg-accent-warm" />
      </span>
      <svg
        width="132"
        height="35"
        viewBox="0 0 76 20"
        className="shrink-0 text-accent-warm"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      >
        <path d="M2 10h14M60 10h14" strokeLinecap="round" />
        <path d="M24 10l4-4 4 4-4 4z" fill="currentColor" stroke="none" />
        <path d="M44 10l4-4 4 4-4 4z" fill="currentColor" stroke="none" />
        <path d="M38 1.5 46.5 10 38 18.5 29.5 10z" />
        <path
          d="M38 6.5 41.5 10 38 13.5 34.5 10z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
      <span className="relative h-px flex-1 bg-rule-strong">
        <span className="absolute top-1/2 left-0 size-1 -translate-y-1/2 rotate-45 bg-accent-warm" />
      </span>
    </div>
  );
}

export function SectionHead({
  id,
  title,
  dek,
  size = "lg",
}: {
  id: string;
  title: string;
  dek: string;
  /** `xl`: tiêu đề lớn hơn một bậc (khối Chủ đề con ở trang Blog phải lớn hơn tiêu đề danh sách bài ngay dưới) */
  size?: "lg" | "xl";
}) {
  return (
    // Hiện theo thứ tự: tiêu đề (từng từ) → dòng mô tả → họa tiết; không bọc cả khối để tránh hai chuyển động chồng nhau
    <div className="mx-auto max-w-2xl text-center">
      <h2 id={id} className={`${size === "xl" ? "type-display-xl" : "type-display-lg"} text-balance`}>
        <RevealText text={title} />
      </h2>
      <Reveal delay={0.3}>
        <p className="type-ui-body mx-auto mt-s4 max-w-lg text-pretty text-ink-faint">
          {dek}
        </p>
      </Reveal>
      <Reveal delay={0.45}>
        <Ornament />
      </Reveal>
    </div>
  );
}
