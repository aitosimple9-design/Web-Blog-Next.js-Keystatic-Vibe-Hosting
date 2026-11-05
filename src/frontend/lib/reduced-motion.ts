"use client";

// "Giảm chuyển động" an toàn với SSR (sửa lỗi hydration 2026-11-04).
// `useReducedMotion` của motion trả `true` ngay lần vẽ đầu ở trình duyệt, còn server luôn coi là `false`,
// nên style (`transform`) server khác client → React báo "hydrated but some attributes didn't match".
// Hook này dùng `useSyncExternalStore`: lúc hydrate React lấy giá trị server (`false`, khớp HTML), rồi vẽ lại ngay với giá trị thật.
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
