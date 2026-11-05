"use client";

// Hiệu ứng tương tác (theo con trỏ / theo cuộn / đếm số). Quy tắc (CLAUDE.md mục 6, skill motion-system):
// chỉ transform + opacity · tắt khi bật "giảm chuyển động" · chỉ theo chuột khi có con trỏ chính xác (không chạy trên cảm ứng)
// · KHÔNG vòng lặp vô hạn. Hiệu ứng "vào trang" nằm ở CSS (globals.css) để chạy ngay khi vẽ, không đợi JS.
//
// Tối ưu tốc độ mobile (2026-11-05): KHÔNG dùng thư viện `motion` nữa (~56KB JS tải trên mọi trang). Mọi hiệu ứng ghi thẳng
// `style.transform` qua ref trong requestAnimationFrame, nên HTML server không có style động → không lệch khi hydrate.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { motionTokens } from "@/frontend/lib/motion-tokens";
import { useReducedMotionSafe } from "@/frontend/lib/reduced-motion";

/** Hệ số bám theo mỗi khung hình (~ lò xo `springs.follow`: êm, không nảy) */
const FOLLOW = 0.12;

/** Bezier lập phương (x1, y1, x2, y2) → hàm t ∈ [0,1] → tiến độ, cho easing của motionTokens */
function cubicBezier([x1, y1, x2, y2]: readonly [number, number, number, number]) {
  const sample = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  return (x: number) => {
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 20; i++) {
      t = (lo + hi) / 2;
      if (sample(x1, x2, t) < x) lo = t;
      else hi = t;
    }
    return sample(y1, y2, t);
  };
}

/** Gọi `fn` mỗi khung hình khi cuộn / đổi cỡ cửa sổ (gộp nhiều sự kiện vào một khung), và một lần lúc gắn */
function useScrollFrame(fn: () => void, enabled: boolean) {
  const cb = useRef(fn);
  useEffect(() => {
    cb.current = fn;
  });
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const tick = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        cb.current();
      });
    };
    tick();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
    };
  }, [enabled]);
}

/* ---------- Cảnh theo con trỏ: nghiêng nhẹ + nhiều lớp trôi theo độ sâu ---------- */

type PointerListener = (x: number, y: number) => void;
type PointerBus = { subscribe: (fn: PointerListener) => () => void; emit: PointerListener };
const PointerCtx = createContext<PointerBus | null>(null);

function createBus(): PointerBus {
  const listeners = new Set<PointerListener>();
  return {
    subscribe: (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    emit: (x, y) => {
      for (const fn of listeners) fn(x, y);
    },
  };
}

export function PointerScene({
  children,
  className = "",
  tilt = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Góc nghiêng tối đa (độ). 0 = không nghiêng, chỉ trôi các lớp */
  tilt?: number;
}) {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const [bus] = useState(createBus);

  useEffect(() => {
    const el = ref.current;
    const b = bus;
    if (!el || reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // Toạ độ chuẩn hoá -1..1 theo khung; giá trị hiện tại bám dần theo đích (không nảy), dừng vòng lặp khi đã tới đích
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const step = () => {
      cx += (tx - cx) * FOLLOW;
      cy += (ty - cy) * FOLLOW;
      const done = Math.abs(tx - cx) < 0.001 && Math.abs(ty - cy) < 0.001;
      if (done) {
        cx = tx;
        cy = ty;
      }
      if (tilt) el.style.transform = `perspective(1000px) rotateX(${(cy * -tilt).toFixed(3)}deg) rotateY(${(cx * tilt).toFixed(3)}deg)`;
      b.emit(cx, cy);
      raf = done ? 0 : requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
      b.emit(0, 0);
    };
  }, [reduce, tilt, bus]);

  return (
    <PointerCtx.Provider value={bus}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </PointerCtx.Provider>
  );
}

/** Một lớp trong PointerScene; `depth` (px) càng lớn thì trôi càng nhiều. Âm = ngược chiều. */
export function PointerLayer({
  depth,
  children,
  className = "",
}: {
  depth: number;
  children: ReactNode;
  className?: string;
}) {
  const bus = useContext(PointerCtx);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !bus) return;
    const off = bus.subscribe((x, y) => {
      el.style.transform = x || y ? `translate3d(${(x * depth).toFixed(2)}px, ${(y * depth).toFixed(2)}px, 0)` : "";
    });
    return () => {
      off();
      el.style.transform = "";
    };
  }, [bus, depth]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ---------- Đếm số khi cuộn tới (SSR hiển thị số cuối nên không lệch nội dung / SEO) ---------- */

export function CountUp({ to, suffix = "", className = "" }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    el.textContent = `0${suffix}`;
    const ease = cubicBezier(motionTokens.easing.smooth);
    const ms = motionTokens.duration.crawl * 1.3 * 1000;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const frame = (now: number) => {
          const p = Math.min(1, (now - start) / ms);
          el.textContent = `${Math.round(ease(p) * to)}${suffix}`;
          if (p < 1) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = `${to}${suffix}`;
    };
  }, [to, suffix, reduce]);

  return (
    <span ref={ref} className={className}>
      {to}
      {suffix}
    </span>
  );
}

/* ---------- Dải chữ tự trôi chậm (CSS .marquee-run; dừng khi rê chuột, tắt khi giảm chuyển động) ---------- */

export function ScrollMarquee({ words, className = "" }: { words: string[]; className?: string }) {
  const row = [...words, ...words, ...words, ...words];
  return (
    <div aria-hidden className={`marquee-wrap overflow-hidden ${className}`}>
      <div className="marquee-run flex w-max items-center gap-s5 whitespace-nowrap tablet:gap-s6">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-s5 tablet:gap-s6">
            <span>{w}</span>
            <span className="block size-1.5 rotate-45 rounded-[1px] bg-accent-warm opacity-70" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Thanh tiến độ đọc (đầu trang bài) ---------- */

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  // Thanh bám dần theo vị trí cuộn; giảm chuyển động thì nhảy thẳng tới vị trí (không trượt dần)
  const cur = useRef(0);
  const raf = useRef(0);
  useScrollFrame(() => {
    const el = ref.current;
    if (!el) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    cancelAnimationFrame(raf.current);
    if (reduce) {
      cur.current = target;
      el.style.transform = `scaleX(${target})`;
      return;
    }
    const step = () => {
      cur.current += (target - cur.current) * 0.25;
      if (Math.abs(target - cur.current) < 0.001) cur.current = target;
      el.style.transform = `scaleX(${cur.current.toFixed(4)})`;
      raf.current = cur.current === target ? 0 : requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, true);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return <div ref={ref} aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-accent [transform:scaleX(0)]" />;
}

/* ---------- Ảnh trôi chậm hơn nội dung khi cuộn (thị sai) ---------- */

export function ScrollParallax({
  children,
  className = "",
  amount = 8,
}: {
  children: ReactNode;
  className?: string;
  /** % dịch chuyển tối đa; phần tử con nên được phóng 1.15 để không lộ mép */
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const visible = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // Tiến độ 0 → 1 từ lúc mép trên khung chạm đáy màn hình tới lúc mép dưới rời đỉnh màn hình (offset "start end" → "end start")
  useScrollFrame(() => {
    const el = ref.current;
    const img = inner.current;
    if (!el || !img || !visible.current) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
    // Chỉ translate: phóng 1.16 do lớp `scale-[1.16]` (thuộc tính CSS `scale` riêng, cộng với transform)
    img.style.transform = `translateY(${(-amount + 2 * amount * p).toFixed(2)}%)`;
  }, !reduce);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {/* `relative`: ảnh `fill` (absolute) bên trong cần cha có position, nếu không Next cảnh báo "parent element with invalid position" */}
      <div ref={inner} className="relative size-full scale-[1.16]">
        {children}
      </div>
    </div>
  );
}

/* ---------- Lớp trôi dọc theo thanh cuộn (Drift ở Trang chủ, họa tiết Hero Book) ---------- */

/** Ref ghi `translateY` (px) theo scrollY 0 → 700px: từ `from` tới `to`. Giảm chuyển động thì đứng yên ở `from`. */
export function useScrollDrift<T extends HTMLElement>(from: number, to: number) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotionSafe();
  useScrollFrame(() => {
    const el = ref.current;
    if (!el) return;
    const p = Math.min(1, Math.max(0, window.scrollY / 700));
    const y = from + (to - from) * p;
    el.style.transform = y ? `translateY(${y.toFixed(2)}px)` : "";
  }, !reduce);
  useEffect(() => {
    if (reduce && ref.current) ref.current.style.transform = from ? `translateY(${from}px)` : "";
  }, [reduce, from]);
  return ref;
}
