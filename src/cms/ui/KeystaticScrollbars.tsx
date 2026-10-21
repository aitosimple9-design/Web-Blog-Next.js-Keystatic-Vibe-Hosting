"use client";

// THANH CUỘN của trang quản trị Keystatic, vẽ lại cho gọn như trang Settings của Vercel (Lộc yêu cầu 2026-10-20):
// - Keystatic dùng thanh cuộn mặc định của Windows (dày, có nút mũi tên ▲▼) ở menu trái và ở ngay GIỮA trang (vì cột nội dung bị co 880px và đặt giữa).
// - Ở đây: mọi thanh cuộn thành loại MẢNH (không mũi tên), màu pha từ `currentColor` nên đúng ở cả hai theme Light / Dark;
//   khung cuộn của form (trang Cài đặt, form Chủ đề / Sách / Chuyển hướng) kéo ra sát mép phải của vùng nội dung, nội dung bên trong vẫn căn giữa.
// - Form BÀI VIẾT của Keystatic có HAI khung cuộn riêng (trình soạn thảo bên trái, cột thông tin bên phải) nên thấy hai thanh cuộn
//   (Lộc yêu cầu gộp, 2026-10-21): `mergeScrollers()` tìm các khung cuộn trong form, gỡ cuộn riêng của từng khung và cho khung bao ngoài chung cuộn,
//   nên chỉ còn MỘT thanh ở mép phải. Thanh công cụ dính (sticky) của trình soạn thảo vẫn dính vì khung cuộn gần nhất đổi sang khung chung.
// Chỉ đổi HIỂN THỊ ở trình duyệt, không đụng dữ liệu. Chọn phần tử theo cấu trúc `main > form` (cùng cách KeystaticSettingsCards chọn), không theo tên class do Keystatic sinh.
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Chế độ GitHub có thêm /branch/<nhánh>/ sau /keystatic
const POST_FORM_ROUTE = /^\/keystatic\/(?:branch\/[^/]+\/)?collection\/posts\/(?:item\/[^/]+|create)\/?$/;
const MERGE = "data-ks-merge"; // khung bao ngoài chung, cuộn cho cả hai cột
const MERGED = "data-ks-merged"; // khung con bị gỡ cuộn riêng (và các lớp bọc giữa chúng với khung chung)

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
/* globals.css của web công khai có "html { overflow-x: clip }": làm cửa sổ giữ MỘT thanh cuộn riêng (8px, không dùng được) nằm sát thanh cuộn của nội dung, thành hai thanh cạnh nhau. Trang quản trị tự cuộn trong khung của nó nên cửa sổ không cuộn. */
html { overflow: hidden !important; }
main form:has([data-ks-cards]) { max-width: none !important; width: 100%; margin-inline: 0 !important; }
main form:has([data-ks-cards]) > div > div { margin-inline: auto; width: 100%; }
/* Menu trái: thanh cuộn chỉ hiện khi rê chuột vào menu (kiểu Vercel), để trang chỉ còn MỘT thanh cuộn thường trực ở mép phải */
@supports selector(::-webkit-scrollbar) {
  div:has(> nav)::-webkit-scrollbar-thumb { background: transparent; }
  div:has(> nav):hover::-webkit-scrollbar-thumb { background: color-mix(in srgb, currentColor 25%, transparent); background-clip: content-box; }
}
@supports not selector(::-webkit-scrollbar) {
  div:has(> nav) { scrollbar-color: transparent transparent; }
  div:has(> nav):hover { scrollbar-color: color-mix(in srgb, currentColor 28%, transparent) transparent; }
}
[${MERGE}] { overflow-y: auto !important; align-items: flex-start !important; }
[${MERGED}] { overflow: visible !important; height: auto !important; max-height: none !important; }
`;

/** Các khung đang tự cuộn trong form (không tính khung chung đã đánh dấu). */
function scrollersIn(form: Element): HTMLElement[] {
  return [...form.querySelectorAll<HTMLElement>("div")].filter((e) => {
    const o = getComputedStyle(e).overflowY;
    return (o === "auto" || o === "scroll") && e.scrollHeight > e.clientHeight + 2;
  });
}

/** Khung bao gần nhất chứa cả hai khung. */
function commonAncestor(a: HTMLElement, b: HTMLElement): HTMLElement | null {
  for (let p = a.parentElement; p; p = p.parentElement) if (p.contains(b)) return p;
  return null;
}

function mergeScrollers() {
  if (!POST_FORM_ROUTE.test(location.pathname)) return;
  const form = document.querySelector("main form");
  if (!form || form.querySelector(`[${MERGE}]`)) return;
  const list = scrollersIn(form);
  if (list.length < 2) return;
  let root: HTMLElement | null = list[0];
  for (const s of list.slice(1)) root = root ? commonAncestor(root, s) : null;
  if (!root || !form.contains(root)) return;
  root.setAttribute(MERGE, "");
  for (const s of list) for (let e: HTMLElement | null = s; e && e !== root; e = e.parentElement) e.setAttribute(MERGED, "");
}

export function KeystaticScrollbars() {
  const pathname = usePathname();
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  useEffect(() => {
    if (!POST_FORM_ROUTE.test(pathname)) return;
    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(mergeScrollers, 100); // setTimeout thay vì requestAnimationFrame: tab chạy nền không bị treo
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [pathname]);
  return null;
}
