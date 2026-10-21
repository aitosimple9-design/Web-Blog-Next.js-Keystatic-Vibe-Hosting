"use client";

// THANH ĐIỀU HƯỚNG phía trên (breadcrumb "Bài viết > slug") của form trong trang quản trị Keystatic, làm lại cho gọn và nổi (Lộc yêu cầu 2026-10-21):
// - Keystatic để icon lệch so với chữ và vẽ mục hiện tại (slug) trong khung có viền đen mảnh ở trên, trông thô.
// - Ở đây: thanh trên cùng thấp 44px, nút 28px, chữ 13px; icon và chữ căn giữa dọc; mục cha nhạt (rê chuột thì rõ), mục hiện tại đậm; mũi tên ngăn cách nhạt.
// Chọn phần tử theo tên class chứa "Breadcrumb" (Keystatic đặt nhãn ổn định `kui:Breadcrumb` ở class, không phải mã băm). Màu dùng `currentColor` nên đúng ở cả hai theme.
// Chỉ đổi HIỂN THỊ ở trình duyệt, không đụng dữ liệu.
import { useEffect } from "react";

const CSS = `
/* Thanh trên cùng của form: thấp 44px, nút nhỏ gọn */
main > header > div { height: 44px !important; min-height: 44px !important; padding-inline: 16px !important; }
main > header button { height: 28px !important; min-height: 28px !important; border-radius: 6px; font-size: 13px; }
main > header button:not(:has(svg:only-child)) { padding-inline: 14px; }
/* Breadcrumb: chữ 13px, thẳng hàng, mục hiện tại đậm, mục cha nhạt (rê chuột thì rõ) */
ul[class*="Breadcrumb"] { display: flex; align-items: center; gap: 0; }
ul[class*="Breadcrumb"] li { display: flex; align-items: center; min-height: 28px; border-top: 0 !important; padding-top: 0 !important; font-size: 13px; line-height: 1; }
ul[class*="Breadcrumb"] li:not(:last-child) a { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 6px; border-radius: 6px; font-size: 13px; font-weight: 500; line-height: 1; text-decoration: none; opacity: .62; transition: opacity .15s; }
ul[class*="Breadcrumb"] li:not(:last-child) a:hover { opacity: 1; }
ul[class*="Breadcrumb"] li:not(:last-child) a > span { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; }
ul[class*="Breadcrumb"] li:not(:last-child) a > span > svg { display: block; width: 14px; height: 14px; }
ul[class*="Breadcrumb"] li > svg { flex: none; width: 14px; height: 14px; opacity: .35; }
ul[class*="Breadcrumb"] li:last-child { max-width: 48ch; padding: 0 4px !important; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

export function KeystaticBreadcrumb() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  return null;
}
