"use client";

// Họa tiết nền cho Hero Trang Book (nền tối `inverse`, KHÔNG ảnh, KHÔNG gradient; Lộc duyệt 2026-10-11). Toàn bộ chỉ dùng token màu, aria-hidden.
// Ba lớp, từ sau ra trước: (1) dòng kẻ ngang mảnh như trang vở · (2) chữ "Đọc" khổng lồ chỉ có nét viền, như con dấu in chìm ·
// (3) vòng tròn phẳng `accent-warm` + vòng viền lệch tâm, ló sau thẻ bài nổi bật.
// Chuyển động: chỉ transform, trôi nhẹ theo thanh cuộn (chữ đi lên, vòng tròn đi xuống), tắt khi giảm chuyển động, không vòng lặp.
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const defaultOrb =
  "absolute top-[4%] right-[6%] hidden size-[clamp(96px,13vw,120px)] tablet:block desktop:top-[5%] desktop:right-[27%] desktop:size-[clamp(150px,17vw,230px)]";

/** `word`: chữ viền khổng lồ (Trang Book: "Đọc"; Trang chủ cá nhân: tên ngắn). `orbClassName`: vị trí vòng tròn nếu khác mặc định */
export function HeroBackdrop({ word = "Đọc", orbClassName = defaultOrb }: { word?: string; orbClassName?: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const wordY = useTransform(scrollY, [0, 700], [0, -60]);
  const orbY = useTransform(scrollY, [0, 700], [0, 70]);
  const drift = (y: typeof wordY) => (reduce ? undefined : { y });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden text-on-inverse">
      {/* (1) Dòng kẻ như vở: SVG pattern (không dùng gradient CSS) */}
      <svg className="absolute inset-0 size-full opacity-[0.07]" focusable="false">
        <defs>
          <pattern id="hero-ruled" width="8" height="44" patternUnits="userSpaceOnUse">
            <path d="M0 43.5h8" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-ruled)" />
      </svg>

      {/* (2) Chữ khổng lồ chỉ có nét viền */}
      <motion.div style={drift(wordY)} className="absolute -bottom-[4%] left-[1%] w-[min(100%,920px)] opacity-[0.2]">
        <svg viewBox="0 0 1000 440" className="w-full" focusable="false">
          <text
            x="0"
            y="400"
            fontSize="470"
            fontWeight="600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            style={{ fontFamily: "var(--font-serif-stack)" }}
          >
            {word}
          </text>
        </svg>
      </motion.div>

      {/* (3) Vòng tròn phẳng accent-warm + vòng viền lệch tâm (nhỏ, ló sau góc trên phải của thẻ ảnh; ẩn dưới 768px vì đè lên tiêu đề) */}
      <motion.div
        style={drift(orbY)}
        className={orbClassName}
      >
        <span className="absolute inset-0 rounded-pill bg-accent-warm" />
        <span className="absolute -inset-[14%] translate-x-[8%] translate-y-[6%] rounded-pill border-(length:--border-width) border-on-inverse/25" />
      </motion.div>
    </div>
  );
}
