"use client";

// Trang quản trị Keystatic: menu trái chỉ có chữ. Component này thêm ICON trước từng mục và ĐƯỜNG PHÂN CÁCH giữa các nhóm (giống menu app điện thoại):
// mỗi nhóm cách nhau một vạch mảnh, tiêu đề nhóm nhỏ, mục có chiều cao thoải mái, icon cùng màu chữ nên theo cả hai chế độ sáng / tối của Keystatic.
// Keystatic không có tùy chọn icon cho menu (ui.navigation chỉ nhận tên), nên chỉ đổi HIỂN THỊ ở trình duyệt, không đụng dữ liệu. Icon dạng nét (lucide, ISC).
// Nhận mục theo đuôi địa chỉ: /collection/<id>, /singleton/<id>; mục Dashboard là liên kết còn lại trong menu. Mục mới chưa có icon thì dùng icon file.
import { useEffect } from "react";

const ATTR = "data-ks-nav-icon";
const STYLE_ID = "ks-nav-icons-style";

// Thân SVG (viewBox 24x24, nét 1.75, không tô) theo từng loại
const SVG: Record<string, string> = {
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  posts: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  topics: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  books: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  redirects: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
  homePage: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  bookPage: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  blogPage: '<path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/>',
  articlePage: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  notFoundPage: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  privacyPage: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  contactPage: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  siteSettings: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  headerSettings: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/>',
  footerSettings: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 15h18"/>',
  newsletterSettings: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  uiLabels: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  fallback: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
};

// Các nhóm của menu là <li> con của <ul> đầu tiên trong <nav>; tiêu đề nhóm là <h3>. Vạch phân cách đặt ở đầu mỗi nhóm từ nhóm thứ hai trở đi.
const CSS = `
nav > ul > li + li { margin-top: 6px; padding-top: 10px; border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
nav > ul > li > h3 { letter-spacing: .06em; opacity: .7; margin-bottom: 4px; }
nav a:has(> [${ATTR}]), nav a[${ATTR}-row] { align-items: center; gap: 10px; min-height: 36px; }
[${ATTR}] { display: inline-flex; flex: none; width: 18px; height: 18px; opacity: .8; }
[${ATTR}] svg { width: 18px; height: 18px; }
nav a[aria-current="page"] [${ATTR}], nav a:hover [${ATTR}] { opacity: 1; }`;

function keyOf(a: HTMLAnchorElement): string {
  const m = (a.getAttribute("href") ?? "").match(/\/(?:collection|singleton)\/([^/?#]+)/);
  return m ? m[1] : "dashboard";
}

function mark() {
  for (const a of document.querySelectorAll<HTMLAnchorElement>("nav a[href]")) {
    if (a.querySelector(`[${ATTR}]`)) continue;
    const key = keyOf(a);
    const span = document.createElement("span");
    span.setAttribute(ATTR, key);
    span.setAttribute("aria-hidden", "true");
    span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false">${SVG[key] ?? SVG.fallback}</svg>`;
    a.prepend(span);
    a.setAttribute(`${ATTR}-row`, "");
  }
}

export function KeystaticNavIcons() {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(mark, 50); // setTimeout thay vì requestAnimationFrame: tab chạy nền không bị treo
    };
    // Bỏ qua thay đổi do chính mình gây ra (thêm icon) để khỏi lặp vô hạn
    const own = (n: Node) => n instanceof HTMLElement && n.hasAttribute(ATTR);
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => [...m.addedNodes, ...m.removedNodes].some((n) => !own(n)))) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      document.getElementById(STYLE_ID)?.remove();
      for (const el of document.querySelectorAll(`[${ATTR}]`)) el.remove();
      for (const a of document.querySelectorAll(`a[${ATTR}-row]`)) a.removeAttribute(`${ATTR}-row`);
    };
  }, []);
  return null;
}
