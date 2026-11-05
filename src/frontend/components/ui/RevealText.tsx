"use client";

// Chữ hiện từng từ khi cuộn tới: mỗi từ trượt lên từ sau mặt nạ (cùng kiểu `word-mask` / `anim-word` của hero).
// An toàn SSR / không JS: chữ LUÔN hiển thị trước; chỉ tiêu đề nằm dưới màn hình đầu mới được ẩn rồi hiện lại.
// Chỉ transform; tắt hoàn toàn khi bật "giảm chuyển động". Chạy MỘT lần.
// Tối ưu tốc độ mobile (2026-11-05): Web Animations API (`el.animate`), không dùng thư viện motion; vị trí lấy từ IntersectionObserver.
import { useEffect, useRef } from "react";
import { motionTokens } from "@/frontend/lib/motion-tokens";

const STEP = 0.06; // giây giữa hai từ liền nhau (trong khoảng 0.05–0.10 của skill motion-system)
const MAX_TOTAL = 0.5; // tiêu đề dài thì rút ngắn bước để tổng độ trễ không quá 0.5s
const EASE = `cubic-bezier(${motionTokens.easing.smooth.join(",")})`;

export function RevealText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const words = text.split(" ").filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
    const step = Math.min(STEP, MAX_TOTAL / Math.max(items.length - 1, 1));
    let first = true;
    let hidden = false;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (first) {
          first = false;
          // Đang nằm trong màn hình đầu: không ẩn, không nháy
          if (e.boundingClientRect.top < window.innerHeight * 0.92) {
            io.disconnect();
            return;
          }
          for (const w of items) w.style.transform = "translateY(112%)";
          hidden = true;
          return;
        }
        if (!hidden || !entries.some((x) => x.isIntersecting)) return;
        io.disconnect();
        items.forEach((w, i) => {
          const anim = w.animate([{ transform: "translateY(112%)" }, { transform: "translateY(0%)" }], {
            duration: motionTokens.duration.slow * 1000,
            delay: i * step * 1000,
            easing: EASE,
            fill: "backwards",
          });
          w.style.transform = "";
          anim.onfinish = () => anim.cancel();
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      for (const w of items) w.style.transform = "";
    };
  }, [text]);

  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="word-mask">
            <span data-word className="inline-block">
              {w}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
