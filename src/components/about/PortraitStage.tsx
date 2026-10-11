"use client";

// Sân khấu 3D cho chân dung ở Hero Trang chủ. Các lớp nằm ở độ sâu khác nhau (translateZ) trong một khối `preserve-3d`:
// vòng tròn phẳng + khung viền ở SAU ảnh, ảnh ở giữa, thẻ tên + bìa sách nổi TRƯỚC ảnh.
// Chuyển động: khối nghiêng theo con trỏ (chỉ khi có chuột) và xoay nhẹ theo thanh cuộn (chạy cả trên cảm ứng); do có độ sâu nên
// các lớp tự lệch nhau (thị sai thật). Chỉ transform, tắt khi giảm chuyển động, không vòng lặp.
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { springs } from "@/lib/motion-tokens";

const depth = (z: number) => ({ transform: `translateZ(${z}px)` });

export function PortraitStage({
  photo,
  book,
  badge,
  className = "",
}: {
  photo: ReactNode;
  book: ReactNode;
  badge: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, springs.follow);
  const y = useSpring(rawY, springs.follow);
  const { scrollY } = useScroll();
  const scrollTurn = useTransform(scrollY, [0, 640], [0, -16]);
  const rotateY = useTransform([x, scrollTurn], ([px, st]: number[]) => px * 14 + st);
  const rotateX = useTransform(y, (v) => v * -9);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      rawX.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2)));
      rawY.set(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2)));
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, rawX, rawY]);

  return (
    <div ref={ref} className={`[perspective:1100px] ${className}`}>
      <motion.div
        className="relative mx-auto w-full [transform-style:preserve-3d]"
        style={reduce ? undefined : { rotateX, rotateY }}
      >
        {/* Sau ảnh: vòng tròn phẳng accent-warm (họa tiết) và khung viền lệch */}
        <span aria-hidden className="absolute -top-[7%] -right-[9%] size-[46%] rounded-pill bg-accent-warm" style={depth(-90)} />
        <span
          aria-hidden
          className="absolute inset-0 translate-x-[5%] translate-y-[4%] rounded-lg border-(length:--border-width) border-on-inverse/30"
          style={depth(-40)}
        />

        {/* Ảnh chân dung */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-paper-deep shadow-elevated-lg" style={depth(0)}>
          {photo}
        </div>

        {/* Trước ảnh: bìa sách nghiêng + thẻ tên */}
        <div className="pointer-events-none absolute -right-[7%] bottom-[14%] w-[30%]" style={depth(90)}>
          <div className="rotate-6">{book}</div>
        </div>
        <div className="absolute inset-x-[6%] bottom-[-4%]" style={depth(55)}>
          {badge}
        </div>
      </motion.div>
    </div>
  );
}
