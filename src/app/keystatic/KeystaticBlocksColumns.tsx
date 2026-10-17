"use client";

// Trang quản trị Keystatic: nhóm "Các khối của trang" (Trang chủ, Book, Blog, Trang bài) có mỗi khối một ô nên rất dài khi xếp dọc.
// Keystatic xếp ô trong lưới 12 cột nhưng không cho chọn cột, nên component này đánh dấu các ô của nhóm đó để CSS xếp 4 cột (từ 900px),
// 2 cột (từ 640px), các ô cao đều nhau và ô nhập dãn hết bề ngang cột. Ô số trống hiện số mặc định dạng chữ mờ (placeholder). Chỉ đổi HIỂN THỊ ở trình duyệt, không đụng dữ liệu.
// Nhận ra nhóm qua tiêu đề do keystatic.config.ts (blocksField) đặt: bắt đầu bằng "Các khối của trang".
import { useEffect } from "react";

const ATTR = "data-ks-block";
const GROUP_TITLE = "Các khối của trang";
const CSS = `
[${ATTR}] { align-self: start; min-width: 0; }
[${ATTR}] input:not([type=checkbox]) { width: 100%; box-sizing: border-box; }
@media (min-width: 640px) { [${ATTR}] { grid-column: span 6 !important; } }
@media (min-width: 900px) { [${ATTR}] { grid-column: span 3 !important; } }`;

function mark() {
  for (const group of document.querySelectorAll<HTMLElement>("[role=group]")) {
    const title = [...group.children].find((c) => c.textContent?.trim().startsWith(GROUP_TITLE));
    if (!title) continue;
    // Lưới các ô là con trực tiếp của nhóm (display: grid) và chứa nhãn của từng khối
    const grid = [...group.children].find((c): c is HTMLElement => c instanceof HTMLElement && c !== title && getComputedStyle(c).display === "grid");
    if (!grid) continue;
    [...grid.children].forEach((cell, i) => {
      if (!cell.hasAttribute(ATTR)) cell.setAttribute(ATTR, "");
      // Ô số để trống = giữ vị trí mặc định (thứ tự các ô cũng là thứ tự mặc định): hiện số mặc định dạng chữ mờ
      const input = cell.querySelector<HTMLInputElement>("input:not([type=checkbox])");
      if (input && input.placeholder !== String(i + 1)) input.placeholder = String(i + 1);
    });
  }
}

export function KeystaticBlocksColumns() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
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
      style.remove();
    };
  }, []);
  return null;
}
