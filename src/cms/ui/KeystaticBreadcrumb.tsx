"use client";

// THANH ĐIỀU HƯỚNG phía trên (breadcrumb "Bài viết > slug") của form trong trang quản trị Keystatic, làm gọn lại (Lộc yêu cầu 2026-10-21):
// - Keystatic vẽ mục hiện tại (slug) bên trong một khung có viền đen mảnh ở trên, trông thô; bỏ viền đó.
// - Mục cha nhỏ và nhạt hơn (14px), mục hiện tại đậm vừa (600); mũi tên ngăn cách nhạt.
// Chọn phần tử theo tên class chứa "Breadcrumb" (Keystatic đặt nhãn ổn định `kui:Breadcrumb` ở class, không phải mã băm). Màu dùng `currentColor` nên đúng ở cả hai theme.
// Chỉ đổi HIỂN THỊ ở trình duyệt, không đụng dữ liệu.
import { useEffect } from "react";

const CSS = `
ul[class*="Breadcrumb"] li { border-top: 0 !important; padding-top: 0 !important; align-items: center; }
ul[class*="Breadcrumb"] li:not(:last-child) a { font-size: 14px; opacity: .7; }
ul[class*="Breadcrumb"] li:not(:last-child) a:hover { opacity: 1; }
ul[class*="Breadcrumb"] li:last-child { font-size: 14px; font-weight: 600; }
ul[class*="Breadcrumb"] li > svg { opacity: .4; }
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
