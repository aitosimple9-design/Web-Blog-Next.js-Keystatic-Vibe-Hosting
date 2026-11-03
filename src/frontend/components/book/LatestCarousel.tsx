"use client";

// Băng chuyền "Bài viết mới nhất" trang Book (Lộc duyệt 2026-11-03, ảnh mẫu `Tài liệu/d651e27064508c8423716fc80ea310b5.jpg`).
// Dưới 768px: trượt ngang, mỗi thẻ rộng 80%, lộ mép thẻ kế, chấm báo vị trí (không nút).
// Từ 768px: băng chuyền XẾP LỚP xoay vòng: thẻ giữa to nhất, hai bên nhỏ dần, lùi ra sau và mờ; chuyển bằng nút ‹ ›, chấm, bấm thẻ bên, phím ← →.
// Vị trí từng thẻ ghi vào `data-pos` (-2..2), CSS `.lc-*` trong globals.css vẽ (chỉ transform + opacity, tắt chuyển động khi giảm chuyển động).
import { useUiLabels } from "@/frontend/components/ui/UiLabels";
import { ArrowLeftIcon, ArrowRightIcon } from "@/frontend/components/ui/Icon";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const DESKTOP = "(min-width: 768px)";

/** Vị trí của thẻ i so với thẻ giữa khi xoay vòng: 0 = giữa, âm = bên trái, dương = bên phải */
export function carouselPos(i: number, active: number, n: number): number {
  const p = (((i - active) % n) + n) % n;
  return p > Math.floor(n / 2) ? p - n : p;
}

export function LatestCarousel({
  items,
  label,
  dimClassName,
}: {
  items: ReactNode[];
  label: string;
  /** Màu lớp mờ phủ thẻ bên = màu nền dải (paper / paper-sunk) */
  dimClassName: string;
}) {
  const ui = useUiLabels();
  const n = items.length;
  const [active, setActive] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const go = useCallback((i: number) => setActive(((i % n) + n) % n), [n]);
  const isDesktop = () => window.matchMedia(DESKTOP).matches;

  // Điện thoại: cập nhật chấm theo vị trí cuộn
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const first = el.firstElementChild as HTMLElement | null;
        if (!first) return;
        const step = first.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);
        const max = el.scrollWidth - el.clientWidth;
        const idx = el.scrollLeft >= max - 2 ? n - 1 : Math.round(el.scrollLeft / step);
        setMobileIdx(Math.max(0, Math.min(n - 1, idx)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [n]);

  const step = (dir: -1 | 1) => {
    if (isDesktop()) return go(active + dir);
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (first.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0)), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="lc">
      <div
        ref={track}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        className="lc-track scrollbar-none"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
      >
        {items.map((it, i) => {
          const pos = carouselPos(i, active, n);
          return (
            <div
              key={i}
              className="lc-item"
              data-pos={pos}
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${n}`}
              // Máy tính: bấm thẻ bên thì đưa thẻ đó vào giữa thay vì mở bài; bấm thẻ giữa mới mở bài
              onClickCapture={(e) => {
                if (pos !== 0 && isDesktop()) {
                  e.preventDefault();
                  e.stopPropagation();
                  go(i);
                }
              }}
              // Bàn phím (Tab) tới liên kết của thẻ bên: đưa thẻ đó vào giữa để thấy rõ thẻ đang chọn
              onFocusCapture={(e) => {
                if (pos !== 0 && isDesktop() && (e.target as HTMLElement).matches(":focus-visible")) go(i);
              }}
            >
              {it}
              <span aria-hidden className={`lc-dim ${dimClassName}`} />
            </div>
          );
        })}
      </div>

      {n > 1 ? (
        <>
          {/* Điện thoại: chấm vị trí (chỉ để nhìn; vuốt để chuyển) */}
          <div className="mt-s2 flex justify-center gap-2 tablet:hidden" aria-hidden>
            {items.map((_, i) => (
              <span
                key={i}
                className={`block h-2 rounded-pill bg-current transition-all duration-200 motion-reduce:transition-none ${i === mobileIdx ? "w-6" : "w-2 opacity-30"}`}
              />
            ))}
          </div>

          {/* Máy tính: ‹ chấm số ›, nút tròn 48px, chấm có vùng bấm 44px */}
          <div className="mt-s5 hidden items-center justify-center gap-s4 tablet:flex">
            <button
              type="button"
              aria-label={ui.sliderPrev}
              onClick={() => go(active - 1)}
              className="lc-btn grid size-12 place-items-center rounded-pill border-(length:--border-width) border-rule-strong bg-paper-raised text-ink shadow-elevated-sm"
            >
              <ArrowLeftIcon size={20} />
            </button>
            <div className="flex items-center gap-s2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${i + 1} / ${n}`}
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => go(i)}
                  className="lc-dot grid size-11 place-items-center"
                />
              ))}
            </div>
            <span className="type-caption min-w-11 text-center tabular-nums text-ink-faint" aria-live="polite">
              {active + 1} / {n}
            </span>
            <button
              type="button"
              aria-label={ui.sliderNext}
              onClick={() => go(active + 1)}
              className="lc-btn grid size-12 place-items-center rounded-pill border-(length:--border-width) border-rule-strong bg-paper-raised text-ink shadow-elevated-sm"
            >
              <ArrowRightIcon size={20} />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
