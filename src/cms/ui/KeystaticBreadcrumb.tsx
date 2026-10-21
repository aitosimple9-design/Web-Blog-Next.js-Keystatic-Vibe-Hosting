"use client";

// THANH ĐIỀU HƯỚNG phía trên (breadcrumb "Bài viết > slug") của form trong trang quản trị Keystatic, làm lại cho gọn và nổi (Lộc yêu cầu 2026-10-21):
// - Keystatic để icon lệch so với chữ và vẽ mục hiện tại (slug) trong khung có viền đen mảnh ở trên, trông thô.
// - Ở đây: mọi mục cao 32px, icon và chữ căn giữa dọc; mục cha là nút nền mờ khi rê chuột; mục hiện tại là viên thuốc nền mờ, chữ đậm; mũi tên ngăn cách nhạt.
// Chọn phần tử theo tên class chứa "Breadcrumb" (Keystatic đặt nhãn ổn định `kui:Breadcrumb` ở class, không phải mã băm). Màu dùng `currentColor` nên đúng ở cả hai theme.
// Chỉ đổi HIỂN THỊ ở trình duyệt, không đụng dữ liệu.
import { useEffect } from "react";

const SOFT = "color-mix(in srgb, currentColor 7%, transparent)";
const CSS = `
ul[class*="Breadcrumb"] { display: flex; align-items: center; gap: 2px; }
ul[class*="Breadcrumb"] li { display: flex; align-items: center; min-height: 32px; border-top: 0 !important; padding-top: 0 !important; }
ul[class*="Breadcrumb"] li:not(:last-child) a { display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 10px; border-radius: 8px; font-size: 15px; font-weight: 500; line-height: 1; text-decoration: none; }
ul[class*="Breadcrumb"] li:not(:last-child) a:hover { background: ${SOFT}; }
ul[class*="Breadcrumb"] li:not(:last-child) a > span { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; }
ul[class*="Breadcrumb"] li:not(:last-child) a > span > svg { display: block; width: 16px; height: 16px; }
ul[class*="Breadcrumb"] li > svg { flex: none; opacity: .45; }
ul[class*="Breadcrumb"] li:last-child { height: 32px; max-width: 48ch; padding: 0 12px !important; border-radius: 8px; background: ${SOFT}; font-size: 15px; font-weight: 600; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
