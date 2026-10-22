"use client";

// Thanh đầu trang (SiteHeader): dính trên cùng, nền mờ, MỘT tầng duy nhất.
// Cuộn quá SCROLL_THRESHOLD: thanh phẳng mờ đi, "viên thuốc" bo tròn nổi lên (chỉ opacity + transform, hai lớp nền chồng nhau).
// <768px: ☰ + Logo trái · tìm kiếm + ☾ phải, ☰ mở ngăn kéo menu (MobileMenu) · 768px+: menu căn giữa, ☰ ẩn · 1024px+: ô tìm kiếm mở rộng.
import { useUiLabels } from "@/frontend/components/ui/UiLabels";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavGroup } from "@/shared/config/site";
import type { LogoImage } from "@/shared/content/settings";
import { CloseIcon, MenuIcon } from "@/frontend/components/ui/Icon";
import { MobileMenu } from "@/frontend/components/layout/MobileMenu";
import { ThemeToggle } from "@/frontend/components/ui/ThemeToggle";
import { SearchBox } from "@/frontend/components/layout/SearchBox";

export type HeaderTone = "paper" | "sunk" | "inverse";

// Cuộn xuống quá ngưỡng này (px) thì thanh đầu trang chuyển sang dạng viên thuốc
const SCROLL_THRESHOLD = 24;

// Kính mờ dùng chung cho hai lớp nền (token header-*)
const glass =
  "bg-[color-mix(in_srgb,var(--hdr-bg)_var(--header-backdrop-opacity),transparent)] backdrop-blur-(--header-blur) backdrop-saturate-(--header-backdrop-saturate)";

// Viên thuốc trong suốt hơn thanh phẳng: nền chỉ 70% (nội dung phía sau lờ mờ hiện qua lớp kính), vẫn làm mờ bằng token header-blur
const pillGlass =
  "bg-[color-mix(in_srgb,var(--hdr-bg)_70%,transparent)] backdrop-blur-(--header-blur) backdrop-saturate-(--header-backdrop-saturate)";

const tones: Record<HeaderTone, { bg: string; text: string; border: string }> = {
  paper: { bg: "var(--paper)", text: "text-ink", border: "border-b-(length:--border-width) border-rule" },
  sunk: { bg: "var(--paper-sunk)", text: "text-ink", border: "" },
  inverse: { bg: "var(--inverse)", text: "text-on-inverse on-inverse", border: "" },
};

// Logo: ảnh (Cài đặt → Header) nếu có, không thì ô vuông + tên site
function Logo({ name, image, alt }: { name: string; image?: LogoImage; alt: string }) {
  return (
    <Link
      href="/"
      className="group tap inline-flex items-center gap-s2 rounded-sm no-underline"
      aria-label={`${name} — về Trang chủ`}
    >
      {image ? (
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={alt}
          priority
          className="h-[calc(var(--logo-size)*1.5)] w-auto max-w-40 object-contain"
        />
      ) : (
        <>
          <span aria-hidden className="block size-[22px] rounded-cover bg-current transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:group-hover:rotate-90" />
          <span className="font-serif text-(length:--logo-size) leading-none font-semibold">{name}</span>
        </>
      )}
    </Link>
  );
}

export function HeaderBar({
  tone,
  navGroups,
  siteName,
  logoImage,
  logoAlt,
  showSearch,
  showThemeToggle,
}: {
  tone: HeaderTone;
  navGroups: NavGroup[];
  siteName: string;
  logoImage?: LogoImage;
  logoAlt: string;
  showSearch: boolean;
  showThemeToggle: boolean;
}) {
  // Menu ngang = các mục cấp trên của mọi nhóm
  const mainNav = navGroups.flatMap((g) => g.items.map(({ label, href }) => ({ label, href })));
  const ui = useUiLabels();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const t = tones[tone];
  // Trang có dải đầu trang tối (inverse): hero kéo lên nằm SAU menu, thanh menu trong suốt nên chìm vào nền hero.
  const overlay = tone === "inverse";

  // Theo dõi vị trí cuộn; chỉ đổi state khi vượt ngưỡng nên không vẽ lại liên tục
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Đóng menu khi đổi trang, khi bấm ra ngoài hoặc nhấn Esc
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
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
      data-scrolled={scrolled}
      className={`group/hdr sticky top-0 z-50 ${t.text} ${overlay ? "-mb-(--header-height)" : ""}`}
    >
      {/* Lớp 1: thanh phẳng toàn bề ngang (đầu trang) — mờ đi khi cuộn. Tông tối: không vẽ, để hero lộ ra phía sau */}
      {!overlay && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 -z-10 ${t.border} ${glass} transition-opacity duration-(--motion-normal) ease-(--ease-smooth) group-data-[scrolled=true]/hdr:opacity-0`}
        />
      )}
      {/* Cuộn xuống: cả hàng nội dung + viên thuốc hạ xuống space-3 (khoảng nổi 12px so với mép trên, viên thuốc cao bằng thanh menu) */}
      <div className="wrap relative grid h-(--header-height) grid-cols-[1fr_auto] items-center gap-s2 transition-transform duration-(--motion-normal) ease-(--ease-smooth) group-data-[scrolled=true]/hdr:translate-y-s3 motion-reduce:transition-none tablet:grid-cols-[1fr_auto_1fr]">
        {/* Lớp 2: viên thuốc bo tròn, nổi bằng elevated-sm — hiện lên và hạ nhẹ vào chỗ khi cuộn */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-x-s3 inset-y-0 tablet:-inset-x-s5 -z-10 rounded-pill border-(length:--border-width) border-current/25 opacity-0 shadow-elevated-sm -translate-y-s1 ${pillGlass} transition-[opacity,transform] duration-(--motion-normal) ease-(--ease-smooth) group-data-[scrolled=true]/hdr:translate-y-0 group-data-[scrolled=true]/hdr:opacity-100 motion-reduce:translate-y-0`}
        />
        <div className="flex items-center gap-s2 justify-self-start">
          <button
            ref={menuButton}
            type="button"
            aria-label={menuOpen ? ui.menuClose : ui.menuOpen}
            aria-expanded={menuOpen}
            aria-controls={panelId}
            onClick={() => setMenuOpen((v) => !v)}
            className="tap -ml-s3 inline-flex items-center justify-center rounded-sm transition-colors duration-(--motion-fast) hover:bg-current/10 tablet:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <Logo name={siteName} image={logoImage} alt={logoAlt} />
        </div>

        <nav aria-label={ui.navMain} className="hidden items-center gap-s1 tablet:flex">
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

        <div className="col-start-2 flex items-center justify-self-end tablet:col-start-3">
          {showSearch ? <SearchBox /> : null}
          {showThemeToggle ? <ThemeToggle /> : null}
        </div>
      </div>

      {/* Menu ngăn kéo cho điện thoại (<768px): trượt từ trái, không phủ tối phần bên phải */}
      <MobileMenu id={panelId} open={menuOpen} pathname={pathname} groups={navGroups} />
    </header>
  );
}
