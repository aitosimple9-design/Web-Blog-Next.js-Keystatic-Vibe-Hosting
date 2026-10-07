"use client";

// Mục lục. 375–1023px: nút "Mục lục ▾" mở / đóng · 1024px+: cột dính (sticky) bên trái.
// Mục đang đọc được đánh dấu bằng vạch + chữ đậm (không chỉ đổi màu).
import { useEffect, useId, useState } from "react";
import type { Heading } from "@/lib/posts";
import { ChevronDownIcon } from "@/components/ui/Icon";

export function TOC({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const id = useId();

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  const list = (
    <ul className="flex flex-col">
      {headings.map((h) => {
        const on = h.id === active;
        return (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={on ? "location" : undefined}
              onClick={() => setOpen(false)}
              className={`type-label tap relative flex items-center rounded-sm py-s2 pl-s4 no-underline transition-colors duration-(--motion-fast) hover:text-ink ${
                on ? "text-ink font-semibold" : "text-ink-soft"
              }`}
            >
              <span
                aria-hidden
                className={`absolute inset-y-2 left-0 w-[3px] rounded-pill bg-accent transition-opacity duration-150 ${on ? "opacity-100" : "opacity-0"}`}
              />
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
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
          className="type-button tap flex w-full items-center justify-between gap-s3 rounded-sm border-(length:--border-width) border-rule-strong px-s4 text-ink transition-colors duration-(--motion-fast) hover:bg-paper-sunk tablet:w-auto tablet:min-w-56"
        >
          Mục lục
          <ChevronDownIcon className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
        </button>
        <div
          id={id}
          inert={!open}
          className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="mt-s2 rounded-md bg-paper-sunk p-s2">{list}</div>
          </div>
        </div>
      </div>

      {/* Từ 1024px: cột dính */}
      <div className="sticky top-[calc(var(--header-height)+var(--space-6))] hidden desktop:block">
        <p className="type-eyebrow mb-s3 pl-s4 uppercase text-ink-faint">Mục lục</p>
        {list}
      </div>
    </nav>
  );
}
