"use client";

// Sân khấu "cánh cửa gập" cho chân dung ở Hero Trang chủ cá nhân (ý tưởng bìa đĩa than gập đôi).
// Lúc vào trang là một tấm bìa đóng kín có chữ cái đầu của tên; sau 0,7s hai cánh xoay về phía người xem (CSS `anim-door-*`, một lần)
// để lộ chân dung. Khối nằm trong không gian 3D: tấm nền `accent-warm` ở sau (z -60), ảnh ở giữa, hai cánh cửa (z 24)
// và hai thẻ số liệu nổi ở trước (z 70). Sau khi mở, khối nghiêng theo con trỏ (chỉ khi có chuột) và xoay nhẹ theo thanh cuộn.
// Chỉ transform + opacity, tắt khi giảm chuyển động (cửa mở sẵn), không vòng lặp.
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { springs } from "@/lib/motion-tokens";
import { CountUp } from "@/components/ui/Motion";

const depth = (z: number): CSSProperties => ({ transform: `translateZ(${z}px)` });
const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

type Door = { initials: string; name: string };

export function GatefoldStage({
  photo,
  left,
  right,
  stats,
  className = "",
}: {
  photo: ReactNode;
  left: Door;
  right: Door;
  stats: { posts: number; topics: number };
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, springs.follow);
  const y = useSpring(rawY, springs.follow);
  const { scrollY } = useScroll();
  const scrollTurn = useTransform(scrollY, [0, 640], [0, -12]);
  const rotateY = useTransform([x, scrollTurn], ([px, st]: number[]) => px * 10 + st);
  const rotateX = useTransform(y, (v) => v * -7);

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

  const face = (d: Door, side: "l" | "r") => (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-between border-(length:--border-width) border-rule bg-paper-raised p-s4 text-ink [backface-visibility:hidden] ${
        side === "l" ? "rounded-l-lg" : "rounded-r-lg"
      }`}
    >
      <span aria-hidden className="block size-1.5 rotate-45 rounded-[1px] bg-accent-warm" />
      <span className="type-display-lg">{d.initials}</span>
      <span className="type-eyebrow uppercase text-ink-faint">{d.name}</span>
    </div>
  );
  const back = (side: "l" | "r") => (
    <div
      className={`absolute inset-0 bg-accent-warm [backface-visibility:hidden] [transform:rotateY(180deg)] ${
        side === "l" ? "rounded-l-lg" : "rounded-r-lg"
      }`}
    />
  );

  return (
    <div ref={ref} className={`[perspective:2200px] ${className}`}>
      <motion.div
        className="relative mx-auto aspect-[3/4] w-full [transform-style:preserve-3d]"
        style={reduce ? undefined : { rotateX, rotateY }}
      >
        {/* Tấm nền phẳng accent-warm ở sau, lệch xuống phải */}
        <span aria-hidden className="absolute inset-0 translate-x-[6%] translate-y-[5%] rounded-lg bg-accent-warm" style={depth(-60)} />

        {/* Chân dung (hiện rõ dần khi cửa mở) */}
        <div className="anim-reveal absolute inset-0 overflow-hidden rounded-lg bg-paper-deep shadow-elevated-lg" style={delay(700)}>
          {photo}
        </div>

        {/* Hai cánh cửa: lớp bọc ngoài đặt độ sâu, lớp trong xoay (animation) */}
        <div className="absolute inset-y-0 left-0 w-1/2 [transform-style:preserve-3d]" style={depth(24)}>
          <div className="anim-door-l absolute inset-0 [transform-style:preserve-3d]" style={delay(700)}>
            {face(left, "l")}
            {back("l")}
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 [transform-style:preserve-3d]" style={depth(24)}>
          <div className="anim-door-r absolute inset-0 [transform-style:preserve-3d]" style={delay(700)}>
            {face(right, "r")}
            {back("r")}
          </div>
        </div>

        {/* Hai thẻ số liệu nổi phía trước, hiện sau khi cửa mở */}
        <div className="absolute bottom-[6%] left-[6%]" style={depth(70)}>
          <div className="anim-fade-rise rounded-md surface-raised px-s4 py-s3 text-ink" style={delay(2000)}>
            <p className="type-display-sm tabular-nums">
              <CountUp to={stats.posts} suffix="+" />
            </p>
            <p className="type-caption text-ink-faint">Bài viết</p>
          </div>
        </div>
        <div className="absolute top-[6%] right-[6%]" style={depth(70)}>
          <div className="anim-fade-rise rounded-md surface-raised px-s4 py-s3 text-ink" style={delay(2150)}>
            <p className="type-display-sm tabular-nums">
              <CountUp to={stats.topics} />
            </p>
            <p className="type-caption text-ink-faint">Chủ đề</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
