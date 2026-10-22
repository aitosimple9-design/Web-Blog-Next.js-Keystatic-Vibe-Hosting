"use client";

// Trang quản trị Keystatic, các trang CÀI ĐẶT (singleton: /keystatic/singleton/<id>) và form Chủ đề / Sách / Chuyển hướng (cùng bố cục một cột;
// form Bài viết có trình soạn thảo + cột bên nên KHÔNG áp dụng): Keystatic xếp mọi ô thành một cột dài, nhãn viết liền một dòng,
// nhìn các ô giống hệt nhau. Component này vẽ lại theo kiểu trang Settings của Vercel: mỗi ô là MỘT THẺ có viền bo góc, tiêu đề đậm,
// một dòng mô tả xám, ô nhập ở giữa, dải chân thẻ nền xám nhạt (ghi chú "để trống = dùng mặc định"). Chỉ đổi HIỂN THỊ ở trình duyệt, không đụng dữ liệu.
// - Nhãn gốc của Keystatic KHÔNG bị xóa: chỉ ẩn bằng kiểu "chỉ trình đọc màn hình thấy" (tên truy cập của ô giữ nguyên, bấm vào chữ vẫn focus ô).
// - Tiêu đề / mô tả / chân thẻ là phần tử do ta chèn (data-ks-card-head / -foot), tách từ nhãn bằng splitLabel (settings-card-text.ts).
// - Màu chỉ dùng `currentColor` pha trong suốt nên đúng ở cả hai theme Light / Dark của Keystatic.
// - Mọi thay đổi DOM chỉ ghi khi giá trị đổi (ghi lặp làm các bộ quan sát khác chạy lại mãi, xem KeystaticRedirectTools.tsx).
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { splitLabel } from "./settings-card-text";
import { isDarkTheme } from "./ks-theme";

// Chế độ GitHub có thêm /branch/<nhánh>/ sau /keystatic
export const CARD_ROUTE = /^\/keystatic\/(?:branch\/[^/]+\/)?(?:singleton\/|collection\/(?:topics|subtopics|books|redirects)\/(?:item\/[^/]+|create)\/?$)/;
const LIST = "data-ks-cards";
const CARD = "data-ks-card";
const HEAD = "data-ks-card-head";
const FOOT = "data-ks-card-foot";
const HIDDEN_LABEL = "data-ks-card-label";
const SUB = "data-ks-sub-head";
const SOFT = "color-mix(in srgb, currentColor 14%, transparent)";

const CSS = `
[${LIST}] { display: flex !important; flex-direction: column; gap: 24px; width: 100%; max-width: 880px; margin-inline: auto; }
[${CARD}] { color: var(--ks-card-fg, #0a0a0a); grid-column: auto !important; min-width: 0; border: 1px solid ${SOFT}; border-radius: 10px; background: var(--ks-card-bg, #fff); }
main form:has([${LIST}]) { max-width: 880px; width: 100%; margin-inline: auto; }
main form:has([${LIST}]) > div { max-width: none; }
[${CARD}] > div:not([${HEAD}]):not([${FOOT}]) { padding: 16px 24px 24px; }
[${CARD}][data-ks-card-bare] > :not([${HEAD}]):not([${FOOT}]) { padding: 16px 24px; }
[${HEAD}] { padding: 20px 24px 0; }
[${HEAD}] > :first-child { font-size: 18px; font-weight: 600; line-height: 1.35; }
[${HEAD}] > :nth-child(2) { margin-top: 4px; font-size: 14px; line-height: 1.5; color: color-mix(in srgb, currentColor 70%, transparent); }
[${SUB}] { margin: 0 0 4px; }
[${SUB}] > :first-child { font-size: 14px; font-weight: 600; line-height: 1.4; }
[${SUB}] > :nth-child(2) { margin-top: 2px; font-size: 13px; line-height: 1.5; color: color-mix(in srgb, currentColor 70%, transparent); }
[${FOOT}] { padding: 12px 24px; border-top: 1px solid ${SOFT}; border-radius: 0 0 9px 9px; background: color-mix(in srgb, currentColor 5%, transparent); font-size: 13px; line-height: 1.5; color: color-mix(in srgb, currentColor 70%, transparent); }
[${HIDDEN_LABEL}] { position: absolute !important; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
@media (max-width: 640px) {
  [${CARD}] > div:not([${HEAD}]):not([${FOOT}]) { padding: 12px 16px 20px; }
  [${CARD}][data-ks-card-bare] > :not([${HEAD}]):not([${FOOT}]) { padding: 14px 16px; }
  [${HEAD}] { padding: 16px 16px 0; }
  [${FOOT}] { padding: 10px 16px; }
}`;

/** Nhãn của ô: `<label>` (ô chữ, số) hoặc dòng tiêu đề đầu của nhóm (ảnh, danh sách, nhóm ô). null nếu không nhận ra. */
function labelOf(cell: Element): HTMLElement | null {
  const inner = cell.firstElementChild;
  if (!inner) return null;
  const direct = [...inner.children].find((c): c is HTMLElement => c instanceof HTMLElement && c.tagName === "LABEL");
  if (direct) return direct;
  const group = [...inner.children].find((c) => c.getAttribute("role") === "group") ?? (inner.getAttribute("role") === "group" ? inner : null);
  // Ô soạn thảo văn bản: nhãn là <span> đầu tiên ngay trong ô (không bọc trong role=group)
  const first = (group ?? inner).firstElementChild;
  return first instanceof HTMLElement && first.tagName === "SPAN" && first.textContent?.trim() ? first : null;
}

const setText = (el: Element, text: string) => {
  if (el.textContent !== text) el.textContent = text;
};

function ensure(cell: HTMLElement, attr: string, where: "start" | "end", build: () => HTMLElement): HTMLElement {
  let el = cell.querySelector<HTMLElement>(`:scope > [${attr}]`);
  if (!el) {
    el = build();
    el.setAttribute(attr, "");
    if (where === "start") cell.prepend(el);
    else cell.append(el);
  }
  return el;
}

function decorate(cell: HTMLElement) {
  if (!cell.hasAttribute(CARD)) cell.setAttribute(CARD, "");
  const label = labelOf(cell);
  // Ô tích chọn (label bọc luôn ô tích) hoặc không có nhãn: giữ nguyên nhãn gốc, chỉ bọc thẻ cho thống nhất
  const wrapsControl = !!label?.querySelector("input, textarea, button, select");
  decorateNested(cell);
  if (!label || wrapsControl) {
    if (!cell.hasAttribute("data-ks-card-bare")) cell.setAttribute("data-ks-card-bare", "");
    return;
  }
  const { title, description, footer } = splitLabel(label.textContent ?? "");
  if (!title) return;

  const head = ensure(cell, HEAD, "start", () => {
    const h = document.createElement("div");
    h.append(document.createElement("div"), document.createElement("div"));
    h.setAttribute("aria-hidden", "true"); // nhãn gốc (ẩn bằng kiểu chỉ trình đọc màn hình thấy) đã là tên truy cập của ô
    return h;
  });
  setText(head.children[0], title);
  setText(head.children[1], description);
  if ((head.children[1] as HTMLElement).style.display !== (description ? "" : "none")) (head.children[1] as HTMLElement).style.display = description ? "" : "none";
  if (!label.hasAttribute(HIDDEN_LABEL)) label.setAttribute(HIDDEN_LABEL, "");

  const foot = cell.querySelector<HTMLElement>(`:scope > [${FOOT}]`);
  if (footer) setText(ensure(cell, FOOT, "end", () => document.createElement("div")), footer);
  else foot?.remove();
}

/** Nhãn của các ô LỒNG trong nhóm (ví dụ "Nhãn và thông báo của form"): nhãn có phần "(mô tả)" thì tách thành tiêu đề đậm + dòng xám nhỏ. */
function decorateNested(cell: HTMLElement) {
  // Ô lồng thật luôn nằm TRONG một nhóm (role=group); nhãn của ô ngoài cùng thì không (nhãn xuất hiện trước khi cấu trúc dựng xong nên không dựa vào "nhãn ngoài cùng" được)
  const nested = (l: Element) => l.parentElement?.closest("[role=group]") != null && cell.contains(l.parentElement.closest("[role=group]"));
  for (const head of cell.querySelectorAll(`[${SUB}]`)) if (!head.nextElementSibling || !nested(head.nextElementSibling)) head.remove();
  for (const label of cell.querySelectorAll<HTMLElement>("label")) {
    if (!nested(label) || label.querySelector("input, textarea, button, select")) continue;
    const prev = label.previousElementSibling;
    const { title, description, footer } = splitLabel(label.textContent ?? "");
    const desc = [description, footer].filter(Boolean).join(" ");
    if (!title || !desc) continue;
    let head = prev?.hasAttribute(SUB) ? (prev as HTMLElement) : null;
    if (!head) {
      head = document.createElement("div");
      head.setAttribute(SUB, "");
      head.setAttribute("aria-hidden", "true");
      head.append(document.createElement("div"), document.createElement("div"));
      label.before(head);
    }
    setText(head.children[0], title);
    setText(head.children[1], desc);
    if (!label.hasAttribute(HIDDEN_LABEL)) label.setAttribute(HIDDEN_LABEL, "");
  }
}

function mark() {
  if (!CARD_ROUTE.test(location.pathname)) return;
  // main > form > div > div > div (lưới các ô)
  const grid = document.querySelector<HTMLElement>("main form > div > div > div");
  if (!grid || getComputedStyle(grid).display === "none") return;
  if (!grid.hasAttribute(LIST)) grid.setAttribute(LIST, "");
  // Keystatic có nút Light / Dark riêng (không theo data-theme của web): đo độ sáng nền để chọn nền thẻ (sáng: trắng hơn nền trang; tối: sáng hơn nền trang một chút) và màu chữ tiêu đề / mô tả (chữ của Keystatic đặt màu riêng từng ô nên không kế thừa được)
  const dark = isDarkTheme();
  const vars = { "--ks-card-bg": dark ? "color-mix(in srgb, #fff 5%, transparent)" : "#fff", "--ks-card-fg": dark ? "#ededed" : "#0a0a0a" };
  for (const [k, v] of Object.entries(vars)) if (grid.style.getPropertyValue(k) !== v) grid.style.setProperty(k, v);
  for (const cell of grid.children) if (cell instanceof HTMLElement) decorate(cell);
}

export function KeystaticSettingsCards() {
  const pathname = usePathname();
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(mark, 50); // setTimeout thay vì requestAnimationFrame: tab chạy nền không bị treo
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
