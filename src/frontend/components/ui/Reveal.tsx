"use client";

// Hiện dần khi cuộn tới (fade + trượt nhẹ). An toàn SSR / không JS: nội dung LUÔN hiển thị trước,
// chỉ phần nằm dưới màn hình đầu mới được ẩn rồi hiện lại. Tắt hoàn toàn khi bật "giảm chuyển động".
// Tối ưu tốc độ mobile (2026-11-05): dùng Web Animations API của trình duyệt (`el.animate`), không dùng thư viện motion;
// vị trí lấy từ lần báo đầu tiên của IntersectionObserver (không gọi getBoundingClientRect lúc gắn, tránh ép trình duyệt tính lại bố cục cho từng khối).
import { useEffect, useRef, type ReactNode } from "react";
import { motionTokens } from "@/frontend/lib/motion-tokens";

const EASE = `cubic-bezier(${motionTokens.easing.smooth.join(",")})`;

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
    let first = true;
    let hidden = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (first) {
            first = false;
            // Đang nằm trong (hoặc gần) màn hình đầu: không ẩn, không nháy
            if (e.boundingClientRect.top < window.innerHeight * 0.92) {
              io.disconnect();
              return;
            }
            el.style.opacity = "0";
            el.style.transform = `translateY(${motionTokens.distance.lg}px)`;
            hidden = true;
            continue;
          }
          if (!e.isIntersecting || !hidden) continue;
          io.disconnect();
          const anim = el.animate(
            [
              { opacity: 0, transform: `translateY(${motionTokens.distance.lg}px)` },
              { opacity: 1, transform: "translateY(0px)" },
            ],
            { duration: motionTokens.duration.slow * 1000, delay: delay * 1000, easing: EASE, fill: "backwards" },
          );
          el.style.opacity = "";
          el.style.transform = "";
          anim.onfinish = () => anim.cancel();
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
