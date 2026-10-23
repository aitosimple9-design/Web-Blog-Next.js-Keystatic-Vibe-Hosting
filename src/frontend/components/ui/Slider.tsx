"use client";

// Thanh trượt ngang dùng chung (chủ đề ở Trang chủ, bài liên quan ở Chi tiết bài).
// Vuốt / cuộn / phím mũi tên; có chấm vị trí và nút ‹ › trượt từng thẻ; nút khóa ở hai đầu.
// `coverflow`: thẻ ở GIỮA to nhất, hai bên nhỏ dần, nghiêng vào giữa và mờ (khối Tủ sách Trang chủ); dừng ở giữa (snap-center), cỡ do `--cf-d` / `--cf-a` (khoảng cách tới tâm) đặt khi cuộn, CSS `.cf-card` trong globals.css vẽ.
// `controls="sides"` (khối chủ đề con ở trang Blog): bỏ hàng chấm, đặt nút ‹ › nổi ở GIỮA hai bên khối (từ 768px; dưới đó chỉ vuốt, để nút không che chữ thẻ); nút ẩn hẳn khi đã tới đầu / cuối.
import { useUiLabels } from "@/frontend/components/ui/UiLabels";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/frontend/components/ui/Icon";

type State = {
  idx: number;
  positions: number;
  atStart: boolean;
  atEnd: boolean;
};

export function Slider({
  items,
  label,
  itemClassName = "",
  trackClassName = "",
  gapClassName = "gap-s4",
  controls = "below",
  coverflow = false,
}: {
  items: ReactNode[];
  label: string;
  itemClassName?: string;
  trackClassName?: string;
  gapClassName?: string;
  controls?: "below" | "sides";
  coverflow?: boolean;
}) {
  const ui = useUiLabels();
  const track = useRef<HTMLDivElement>(null);
  const centered = useRef(false);
  const [s, setS] = useState<State>({
    idx: 0,
    positions: 0,
    atStart: true,
    atEnd: false,
  });

  const measure = useCallback(() => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = first.getBoundingClientRect().width + gap;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 2) {
      setS({ idx: 0, positions: 0, atStart: true, atEnd: true });
      return;
    }
    const positions = Math.round(max / step) + 1;
    const atStart = el.scrollLeft <= 2;
    const atEnd = el.scrollLeft >= max - 2;
    const idx = atEnd
      ? positions - 1
      : Math.min(positions - 1, Math.round(el.scrollLeft / step));
    setS((p) =>
      p.idx === idx &&
      p.positions === positions &&
      p.atStart === atStart &&
      p.atEnd === atEnd
        ? p
        : { idx, positions, atStart, atEnd },
    );
  }, []);

  // Coverflow: đo khoảng cách (tính theo bước thẻ) từ tâm mỗi thẻ tới tâm khung, ghi vào biến CSS của thẻ
  const applyFlow = useCallback(() => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step =
      first.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);
    if (step <= 0) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    for (const child of Array.from(el.children) as HTMLElement[]) {
      const d = Math.max(
        -2,
        Math.min(2, (child.offsetLeft + child.offsetWidth / 2 - mid) / step),
      );
      child.style.setProperty("--cf-d", d.toFixed(3));
      child.style.setProperty("--cf-a", Math.abs(d).toFixed(3));
      child.style.zIndex = String(10 - Math.round(Math.abs(d) * 3));
    }
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        measure();
        if (coverflow) applyFlow();
      });
    };
    if (coverflow && !centered.current) {
      // Lần đầu: đặt bìa ở GIỮA danh sách làm tâm để hai bên đều có sách (instant: bỏ qua scroll-smooth của khung)
      centered.current = true;
      const first = el.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      if (first)
        el.scrollTo({
          left:
            Math.floor((el.children.length - 1) / 2) *
            (first.offsetWidth + gap),
          behavior: "instant",
        });
    }
    measure();
    if (coverflow) applyFlow();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [measure, applyFlow, coverflow]);

  const stepPx = () => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return 0;
    return (
      first.getBoundingClientRect().width +
      (parseFloat(getComputedStyle(el).columnGap) || 0)
    );
  };
  const behavior = (): ScrollBehavior =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  const go = (dir: -1 | 1) =>
    track.current?.scrollBy({ left: dir * stepPx(), behavior: behavior() });

  const showControls = s.positions > 1;
  const sides = controls === "sides";
  const sideBtn =
    "tap absolute top-1/2 z-10 hidden -translate-y-1/2 place-items-center tablet:grid rounded-pill border-(length:--border-width) border-rule-strong bg-paper-raised text-ink shadow-elevated-md transition-[opacity,background-color] duration-(--motion-fast) hover:bg-paper-sunk disabled:pointer-events-none disabled:opacity-0";

  return (
    <div className={sides ? "relative" : undefined}>
      {sides && showControls ? (
        <>
          <button
            type="button"
            aria-label={ui.sliderPrev}
            disabled={s.atStart}
            onClick={() => go(-1)}
            className={`${sideBtn} left-1 desktop:left-0 desktop:-translate-x-1/2`}
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            aria-label={ui.sliderNext}
            disabled={s.atEnd}
            onClick={() => go(1)}
            className={`${sideBtn} right-1 desktop:right-0 desktop:translate-x-1/2`}
          >
            <ArrowRightIcon />
          </button>
        </>
      ) : null}
      <div
        ref={track}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={`scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth ${coverflow ? "relative" : ""} ${gapClassName} ${trackClassName}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            className={`shrink-0 ${coverflow ? "snap-center" : "snap-start"} ${itemClassName}`}
          >
            {coverflow ? <div className="cf-card">{it}</div> : it}
          </div>
        ))}
      </div>

      {showControls && !sides ? (
        <div className="mt-s5 flex items-center justify-between gap-s4">
          <div className="flex items-center gap-2" aria-hidden>
            {Array.from({ length: s.positions }).map((_, i) => (
              <span
                key={i}
                className={`block h-2 rounded-pill transition-all duration-200 motion-reduce:transition-none ${
                  i === s.idx ? "w-6 bg-current" : "w-2 bg-current opacity-30"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={ui.sliderPrev}
              disabled={s.atStart}
              onClick={() => go(-1)}
              className="tap grid place-items-center rounded-sm border-(length:--border-width) border-rule-strong transition-colors duration-(--motion-fast) hover:bg-paper-sunk disabled:pointer-events-none disabled:opacity-35"
            >
              <ArrowLeftIcon />
            </button>
            <button
              type="button"
              aria-label={ui.sliderNext}
              disabled={s.atEnd}
              onClick={() => go(1)}
              className="tap grid place-items-center rounded-sm border-(length:--border-width) border-rule-strong transition-colors duration-(--motion-fast) hover:bg-paper-sunk disabled:pointer-events-none disabled:opacity-35"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
