"use client";

// Mục lục. 375–1023px: nút "Mục lục ▾" mở / đóng · 1024px+: cột dính (sticky) bên trái.
// Trục dọc mảnh có các nút mốc đánh số; đoạn đã đọc phủ màu accent, mục đang đọc có nút to + vòng sáng + chữ đậm (không chỉ đổi màu).
import { useEffect, useId, useState } from "react";
import type { Heading } from "@/lib/posts";
import { ChevronDownIcon } from "@/components/ui/Icon";

export function TOC({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const id = useId();

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
      <ol className="flex flex-col">
        {headings.map((h, i) => {
          const on = h.id === active;
          const passed = i <= activeIndex;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={on ? "location" : undefined}
                onClick={() => setOpen(false)}
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

  return (
    <nav aria-label="Mục lục">
      {/* Dưới 1024px: nút mở / đóng */}
      <div className="desktop:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="type-button tap flex w-full items-center justify-between gap-s3 rounded-pill border-(length:--border-width) border-rule-strong bg-paper-raised px-s5 text-ink shadow-elevated-sm transition-[background-color,box-shadow] duration-(--motion-fast) hover:shadow-elevated-md tablet:w-auto tablet:min-w-64"
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
          className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="mt-s3 rounded-lg border-(length:--border-width) border-rule bg-paper-raised px-s4 py-s3 shadow-elevated-sm">
              {list}
            </div>
          </div>
        </div>
      </div>

      {/* Từ 1024px: cột dính */}
      <div className="sticky top-[calc(var(--header-height)+var(--space-6))] hidden desktop:block">
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
