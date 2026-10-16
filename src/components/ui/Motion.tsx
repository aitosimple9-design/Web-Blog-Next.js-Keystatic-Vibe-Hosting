"use client";

// Hiệu ứng tương tác (theo con trỏ / theo cuộn / đếm số). Quy tắc (CLAUDE.md mục 6, skill motion-system):
// chỉ transform + opacity · tắt khi bật "giảm chuyển động" · chỉ theo chuột khi có con trỏ chính xác (không chạy trên cảm ứng)
// · KHÔNG vòng lặp vô hạn. Hiệu ứng "vào trang" nằm ở CSS (globals.css) để chạy ngay khi vẽ, không đợi JS.
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { motionTokens, springs } from "@/lib/motion-tokens";

/* ---------- Cảnh theo con trỏ: nghiêng nhẹ + nhiều lớp trôi theo độ sâu ---------- */

type Pointer = { x: MotionValue<number>; y: MotionValue<number> };
const PointerCtx = createContext<Pointer | null>(null);

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
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, springs.follow);
  const y = useSpring(rawY, springs.follow);
  const rotateY = useTransform(x, (v) => v * tilt);
  const rotateX = useTransform(y, (v) => v * -tilt);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // Toạ độ chuẩn hoá -1..1 theo khung (cho phép con trỏ ở ngoài khung một chút)
      rawX.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2)));
      rawY.set(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2)));
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, rawX, rawY]);

  return (
    <PointerCtx.Provider value={{ x, y }}>
      <motion.div
        ref={ref}
        className={className}
        style={tilt && !reduce ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      >
        {children}
      </motion.div>
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
  const p = useContext(PointerCtx);
  const reduce = useReducedMotion();
  const zero = useMotionValue(0);
  const tx = useTransform(p?.x ?? zero, (v) => v * depth);
  const ty = useTransform(p?.y ?? zero, (v) => v * depth);
  return (
    <motion.div className={className} style={reduce ? undefined : { x: tx, y: ty }}>
      {children}
    </motion.div>
  );
}

/* ---------- Đếm số khi cuộn tới (SSR hiển thị số cuối nên không lệch nội dung / SEO) ---------- */

export function CountUp({ to, suffix = "", className = "" }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    el.textContent = `0${suffix}`;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        animate(0, to, {
          duration: motionTokens.duration.crawl * 1.3,
          ease: motionTokens.easing.smooth,
          onUpdate: (v) => {
            el.textContent = `${Math.round(v)}${suffix}`;
          },
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
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
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const smooth = useSpring(scrollYProgress, { stiffness: 220, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-accent"
      style={{ scaleX: reduce ? scrollYProgress : smooth }}
    />
  );
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
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {/* `relative`: ảnh `fill` (absolute) bên trong cần cha có position, nếu không Next cảnh báo "parent element with invalid position" */}
      <motion.div className="relative size-full scale-[1.16]" style={reduce ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}
