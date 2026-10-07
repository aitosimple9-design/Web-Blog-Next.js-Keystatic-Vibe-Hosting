"use client";

// Thanh đầu trang (SiteHeader): dính trên cùng, nền mờ, MỘT tầng duy nhất.
// <768px: Logo trái · tìm kiếm + ☾ + ☰ phải · 768px+: menu căn giữa, ☰ ẩn · 1024px+: ô tìm kiếm mở rộng.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { site, mainNav } from "@/config/site";
import { topics } from "@/config/topics";
import { CloseIcon, MenuIcon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchBox, type SearchItem } from "@/components/layout/SearchBox";

export type HeaderTone = "paper" | "sunk" | "inverse";

const tones: Record<HeaderTone, { bg: string; text: string; border: string }> = {
  paper: { bg: "var(--paper)", text: "text-ink", border: "border-b-(length:--border-width) border-rule" },
  sunk: { bg: "var(--paper-sunk)", text: "text-ink", border: "" },
  inverse: { bg: "var(--inverse)", text: "text-on-inverse on-inverse", border: "" },
};

function Logo() {
  return (
    <Link
      href="/"
      className="group tap inline-flex items-center gap-s2 rounded-sm no-underline"
      aria-label={`${site.name} — về Trang chủ`}
    >
      <span aria-hidden className="block size-[22px] rounded-cover bg-current transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:group-hover:rotate-90" />
      <span className="font-serif text-(length:--logo-size) leading-none font-semibold">{site.name}</span>
    </Link>
  );
}

export function HeaderBar({ tone, searchIndex }: { tone: HeaderTone; searchIndex: SearchItem[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLElement>(null);
  const t = tones[tone];

  // Đóng menu khi đổi trang, khi bấm ra ngoài hoặc nhấn Esc
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const linkBase =
    "type-nav tap relative inline-flex items-center rounded-sm px-s3 no-underline transition-opacity duration-(--motion-fast) hover:opacity-70";

  return (
    <header
      ref={root}
      style={{ "--hdr-bg": t.bg } as React.CSSProperties}
      className={`sticky top-0 z-50 ${t.text} ${t.border} bg-[color-mix(in_srgb,var(--hdr-bg)_var(--header-backdrop-opacity),transparent)] backdrop-blur-(--header-blur) backdrop-saturate-(--header-backdrop-saturate)`}
    >
      <div className="wrap relative grid h-(--header-height) grid-cols-[auto_1fr_auto] items-center gap-s2 tablet:grid-cols-[1fr_auto_1fr]">
        <div className="justify-self-start">
          <Logo />
        </div>

        <nav aria-label="Chính" className="hidden items-center gap-s1 tablet:flex">
          {mainNav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`${linkBase} after:absolute after:inset-x-s3 after:bottom-2 after:h-(--border-width-strong) after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-(--motion-normal) after:ease-(--ease-smooth) hover:after:scale-x-100 aria-[current=page]:after:scale-x-100`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 flex items-center justify-self-end tablet:col-start-3">
          <SearchBox index={searchIndex} />
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            aria-controls={panelId}
            onClick={() => setMenuOpen((v) => !v)}
            className="tap inline-flex items-center justify-center rounded-sm transition-colors duration-(--motion-fast) hover:bg-current/10 tablet:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Menu điện thoại: mở dần xuống, ẩn từ 768px */}
      <div
        id={panelId}
        className={`grid bg-(--hdr-bg) transition-[grid-template-rows] duration-200 motion-reduce:transition-none tablet:hidden ${
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        inert={!menuOpen}
      >
        <div className="overflow-hidden">
          <nav aria-label="Menu" className="wrap pt-s2 pb-s5">
            <ul className="flex flex-col">
              {mainNav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className="type-title tap flex items-center py-s2 no-underline aria-[current=page]:underline aria-[current=page]:decoration-(length:--border-width-strong) aria-[current=page]:underline-offset-8"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="type-eyebrow mt-s5 mb-s2 uppercase opacity-70">Chủ đề</p>
            <ul className="flex flex-col">
              {topics.map((tp) => (
                <li key={tp.slug}>
                  <Link href={`/blog/${tp.slug}`} className="type-ui-body tap flex items-center py-s1 no-underline opacity-90">
                    {tp.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
