"use client";

// Mục lục. variant "inline" (dưới 1024px): hàng "Mục lục ▾" trong thẻ chung với nguồn sách · variant "sidebar" (1024px+): cột dính (sticky) bên trái.
// Trục dọc mảnh có các nút mốc đánh số; đoạn đã đọc phủ màu accent, mục đang đọc có nút to + vòng sáng + chữ đậm (không chỉ đổi màu).
import { useEffect, useId, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import type { Heading } from "@/lib/posts";
import { ChevronDownIcon } from "@/components/ui/Icon";

export function TOC({ headings, variant = "sidebar" }: { headings: Heading[]; variant?: "inline" | "sidebar" }) {
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const id = useId();

  // Bấm một mục ở thẻ dưới 1024px: thẻ phải thu lại NGAY (không animation, flushSync cập nhật DOM tại chỗ) RỒI MỚI cuộn.
  // Nếu để thẻ vừa thu vừa cuộn, điểm đến bị tính lúc thẻ còn xổ (cao hơn ~190px) nên cuộn lố, tiêu đề chui xuống sau Header.
  // `scrollIntoView` tự theo `scroll-margin-top` của tiêu đề và `scroll-behavior` của trang (mượt, tắt khi giảm chuyển động).
  const jumpTo = (e: MouseEvent<HTMLAnchorElement>, headingId: string) => {
    const el = document.getElementById(headingId);
    if (!el) return;
    e.preventDefault();
    flushSync(() => {
      setInstant(true);
      setOpen(false);
    });
    el.scrollIntoView();
    history.replaceState(null, "", `#${headingId}`);
    setInstant(false);
  };

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  const activeIndex = Math.max(
    0,
    headings.findIndex((h) => h.id === active),
  );
  // Tiến độ đọc trên trục: 0 → 1 (vạch accent phủ từ mục đầu tới mục đang đọc; chỉ dùng transform)
  const progress =
    headings.length > 1 ? activeIndex / (headings.length - 1) : 0;

  const list = (
    <div className="relative">
      {/* Trục dọc mảnh + đoạn đã đọc */}
      <span
        aria-hidden
        className="absolute top-[19px] bottom-[19px] left-[3px] w-px bg-rule"
      />
      <span
        aria-hidden
        className="absolute top-[19px] bottom-[19px] left-[3px] w-px origin-top bg-accent transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-reduce:transition-none"
        style={{ transform: `scaleY(${progress})` }}
      />
      {/* gap-s2: các mục cao ≥ 44px phải cách nhau ≥ 8px (CLAUDE.md mục 6) */}
      <ol className="flex flex-col gap-s2">
        {headings.map((h, i) => {
          const on = h.id === active;
          const passed = i <= activeIndex;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={on ? "location" : undefined}
                onClick={variant === "inline" ? (e) => jumpTo(e, h.id) : undefined}
                className={`group/toc tap relative flex items-baseline gap-s3 rounded-sm py-s2 pl-s5 no-underline transition-colors duration-(--motion-fast) hover:text-ink ${
                  on ? "text-ink" : "text-ink-soft"
                }`}
              >
                {/* Nút mốc trên trục */}
                <span
                  aria-hidden
                  className={`absolute top-1/2 left-0 size-[7px] -translate-y-1/2 rounded-pill border-(length:--border-width) transition-[transform,background-color,border-color,box-shadow] duration-(--motion-normal) ease-(--ease-smooth) motion-reduce:transition-none ${
                    on
                      ? "scale-150 border-accent bg-accent shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
                      : passed
                        ? "border-accent bg-accent"
                        : "border-rule-strong bg-paper group-hover/toc:scale-125 group-hover/toc:border-ink-soft"
                  }`}
                />
                <span
                  className={`type-caption w-5 shrink-0 tabular-nums transition-colors duration-(--motion-fast) ${
                    on ? "text-accent-warm" : "text-ink-faint"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`type-label ${on ? "font-semibold" : ""}`}>
                  {h.text}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );

  // Dưới 1024px (variant "inline"): hàng "Mục lục ▾" nằm TRONG thẻ chung với nguồn sách (khung do page.tsx đặt), bấm xổ danh sách ngay trong thẻ.
  if (variant === "inline") {
    return (
      <nav aria-label="Mục lục">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="type-button tap flex w-full items-center justify-between gap-s3 px-s4 text-ink"
        >
          <span className="inline-flex items-center gap-s3">
            Mục lục
            <span className="type-caption rounded-pill bg-accent-soft px-s2 py-[2px] tabular-nums text-accent-soft-ink">
              {headings.length}
            </span>
          </span>
          <ChevronDownIcon
            className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          />
        </button>
        <div
          id={id}
          inert={!open}
          className={`grid motion-reduce:transition-none ${instant ? "transition-none" : "transition-[grid-template-rows] duration-200"} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="px-s4 pt-s2 pb-s3">{list}</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    // Từ 1024px chính <nav> là phần tử dính: khối cha của nó (ô lưới ở page.tsx) cao hết bài nên mới có chỗ để trượt.
    // Nếu đặt sticky vào phần tử con bên trong nav (cao đúng bằng nội dung) thì mục lục không bao giờ dính.
    <nav
      aria-label="Mục lục"
      className="sticky top-[calc(var(--header-height)+var(--space-6))]"
    >
      {/* Mục lục dài hơn màn hình thì tự cuộn trong khối này.
          Đệm trái / phải (kèm lề âm) chừa chỗ cho nút mốc tròn và vòng sáng, tránh bị overflow cắt mất nửa vòng tròn. */}
      <div className="-mx-s2 max-h-[calc(100dvh-var(--header-height)-var(--space-6)-var(--space-4))] overflow-y-auto overscroll-contain px-s2">
        <p className="type-eyebrow mb-s3 flex items-center gap-s2 uppercase text-ink-faint">
          <span
            aria-hidden
            className="block size-1.5 rotate-45 rounded-[1px] bg-accent-warm"
          />
          Mục lục
          <span className="tabular-nums normal-case opacity-80">
            · {headings.length}
          </span>
        </p>
        {list}
      </div>
    </nav>
  );
}
