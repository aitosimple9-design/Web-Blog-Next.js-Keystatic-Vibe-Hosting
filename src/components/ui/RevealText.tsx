"use client";

// Chữ hiện từng từ khi cuộn tới: mỗi từ trượt lên từ sau mặt nạ (cùng kiểu `word-mask` / `anim-word` của hero).
// An toàn SSR / không JS: chữ LUÔN hiển thị trước; chỉ tiêu đề nằm dưới màn hình đầu mới được ẩn rồi hiện lại.
// Chỉ transform; tắt hoàn toàn khi bật "giảm chuyển động". Chạy MỘT lần.
import { animate } from "motion/react";
import { useEffect, useRef } from "react";
import { motionTokens } from "@/lib/motion-tokens";

const STEP = 0.06; // giây giữa hai từ liền nhau (trong khoảng 0.05–0.10 của skill motion-system)
const MAX_TOTAL = 0.5; // tiêu đề dài thì rút ngắn bước để tổng độ trễ không quá 0.5s

export function RevealText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const words = text.split(" ").filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Đang nằm trong màn hình đầu: không ẩn, không nháy
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
    const step = Math.min(STEP, MAX_TOTAL / Math.max(items.length - 1, 1));
    for (const w of items) w.style.transform = "translateY(112%)";

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        items.forEach((w, i) => {
          animate(
            w,
            { transform: ["translateY(112%)", "translateY(0%)"] },
            { duration: motionTokens.duration.slow, delay: i * step, ease: motionTokens.easing.smooth },
          ).then(() => {
            w.style.transform = "";
          });
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
