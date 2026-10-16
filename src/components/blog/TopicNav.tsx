"use client";

// Menu chủ đề trên dải tối của trang Blog.
//  - TopicMenu (<768px): nút ☰ + tên chủ đề + ▾, bấm mở danh sách (aria-expanded).
//  - TopicTabs (768–1023px): thanh tab viên tròn, căn giữa. Từ 1024px dùng danh sách dọc trong TopicHero.
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Topic } from "@/lib/topics";
import { ChevronDownIcon, MenuIcon } from "@/components/ui/Icon";

export function TopicMenu({ topics, current }: { topics: Topic[]; current: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const name = topics.find((t) => t.slug === current)?.name ?? "Chủ đề";

  const [lastCurrent, setLastCurrent] = useState(current);
  if (lastCurrent !== current) {
    setLastCurrent(current);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={root} className="tablet:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="type-ui-strong tap flex w-full items-center gap-s3 rounded-sm border-(length:--border-width) border-on-inverse-soft px-s4 text-on-inverse"
      >
        <MenuIcon />
        <span className="flex-1 text-left">{name}</span>
        <ChevronDownIcon className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={id}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <ul className="overflow-hidden">
          <li className="pt-s2" aria-hidden />
          {topics.map((t) => (
            <li key={t.slug} className="mb-s2">
              <Link
                href={`/blog/${t.slug}`}
                aria-current={t.slug === current ? "page" : undefined}
                className="type-ui-body tap flex items-center rounded-sm px-s4 no-underline text-on-inverse-soft hover:bg-on-inverse/10 aria-[current=page]:bg-on-inverse aria-[current=page]:text-inverse"
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TopicTabs({ topics, current }: { topics: Topic[]; current: string }) {
  return (
    <nav aria-label="Chủ đề" className="hidden justify-center tablet:flex desktop:hidden">
      <ul className="flex flex-wrap justify-center gap-2 rounded-pill border-(length:--border-width) border-on-inverse-soft/60 p-1">
        {topics.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/blog/${t.slug}`}
              aria-current={t.slug === current ? "page" : undefined}
              className="type-label tap inline-flex items-center justify-center rounded-pill px-s4 no-underline text-on-inverse-soft transition-colors duration-(--motion-fast) hover:text-on-inverse aria-[current=page]:bg-on-inverse aria-[current=page]:text-inverse"
            >
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
