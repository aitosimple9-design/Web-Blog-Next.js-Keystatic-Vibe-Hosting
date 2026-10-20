"use client";

// THANH CUỘN của trang quản trị Keystatic, vẽ lại cho gọn như trang Settings của Vercel (Lộc yêu cầu 2026-10-20):
// - Keystatic dùng thanh cuộn mặc định của Windows (dày, có nút mũi tên ▲▼) ở menu trái và ở ngay GIỮA trang (vì cột nội dung bị co 880px và đặt giữa).
// - Ở đây: mọi thanh cuộn thành loại MẢNH (scrollbar-width: thin, bỏ mũi tên), màu pha từ `currentColor` nên đúng ở cả hai theme Light / Dark;
//   riêng khung cuộn của form (trang Cài đặt, form Chủ đề / Sách / Chuyển hướng) kéo ra sát mép phải của vùng nội dung, nội dung bên trong vẫn căn giữa.
// Chỉ đổi HIỂN THỊ ở trình duyệt, không đụng dữ liệu. Chọn phần tử theo cấu trúc `main > form` (cùng cách KeystaticSettingsCards chọn), không theo tên class do Keystatic sinh.
import { useEffect } from "react";

const CSS = `
/* Chrome / Edge / Safari: thanh mảnh 8px, thumb bo tròn, KHÔNG nút mũi tên (tiêu chuẩn scrollbar-width vẫn để lại mũi tên nhỏ trên Windows) */
@supports selector(::-webkit-scrollbar) {
  *::-webkit-scrollbar { width: 8px; height: 8px; }
  *::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
  *::-webkit-scrollbar-track, *::-webkit-scrollbar-corner { background: transparent; }
  *::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 999px; background: color-mix(in srgb, currentColor 25%, transparent); background-clip: content-box; }
  *::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, currentColor 45%, transparent); background-clip: content-box; }
}
/* Firefox */
@supports not selector(::-webkit-scrollbar) {
  * { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, currentColor 28%, transparent) transparent; }
}
main form:has([data-ks-cards]) { max-width: none !important; width: 100%; margin-inline: 0 !important; }
main form:has([data-ks-cards]) > div > div { margin-inline: auto; width: 100%; }
`;

export function KeystaticScrollbars() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  return null;
}
