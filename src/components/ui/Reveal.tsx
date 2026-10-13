"use client";

// Hiện dần khi cuộn tới (fade + trượt nhẹ). An toàn SSR / không JS: nội dung LUÔN hiển thị trước,
// chỉ phần nằm dưới màn hình đầu mới được ẩn rồi hiện lại. Tắt hoàn toàn khi bật "giảm chuyển động".
import { animate } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    // Đang nằm trong màn hình đầu: không ẩn, không nháy
    if (rect.top < window.innerHeight * 0.92) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.disconnect();
          animate(
            el,
            { opacity: 1, transform: "translateY(0px)" },
            { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
          ).then(() => {
            el.style.opacity = "";
            el.style.transform = "";
          });
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.style.opacity = "";
      el.style.transform = "";
    };
  }, [delay]);

  const Comp = Tag as "div";
  return (
    <Comp ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </Comp>
  );
}
