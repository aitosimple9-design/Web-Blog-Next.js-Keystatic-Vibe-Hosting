"use client";

// Trang quản trị Keystatic: trong các danh sách (Bài viết, Chủ đề, Sách), cột ảnh chỉ hiện ĐƯỜNG DẪN chữ vì Keystatic không có
// cột kiểu ảnh. Component này thay đường dẫn ảnh (/images/....jpg) trong ô bằng ảnh thu nhỏ.
// Chỉ sửa HIỂN THỊ ở trình duyệt, không đụng dữ liệu. Chỉ chạy dưới /keystatic (gắn ở layout.tsx cùng thư mục).
// Cột "Nguồn sách" của danh sách Bài viết: Keystatic không đọc được khối lồng nên ô hiện "[object Object]"; thay bằng tên sách lấy từ /api/ten-sach.
// Cột "SEO" của danh sách Bài viết: Keystatic không có cột tính toán nên mượn cột "Từ khóa chính" làm chỗ giữ chỗ, đổi tiêu đề thành
// "Điểm SEO" và vẽ điểm (số + chữ Tốt / Cần cải thiện / Chưa đạt, không chỉ màu) lấy từ /api/diem-seo (src/lib/seo-score.ts).
// Danh sách của Keystatic được "ảo hóa" (hàng được tái sử dụng khi cuộn / lọc) nên phải cập nhật lại mỗi khi DOM đổi.
import { useEffect } from "react";

const IMAGE_PATH = /^\/images\/\S+\.(?:jpe?g|png|webp|gif|svg|avif)$/i;
const THUMB_ATTR = "data-ks-thumb";
const HEIGHT = 32; // hàng danh sách cao 45px

const OBJECT_TEXT = "[object Object]";
const BOOK_ATTR = "data-ks-book";
const SEO_ATTR = "data-ks-seo";
const SEO_HEADER = "Từ khóa chính"; // nhãn của ô chọn làm chỗ giữ chỗ (keystatic.config.ts, cột "focusKeyword")
type SeoLevel = "good" | "warn" | "bad";
const SEO_LABEL: Record<SeoLevel, string> = { good: "Tốt", warn: "Cần cải thiện", bad: "Chưa đạt" };
// Màu chữ đủ tương phản (≥ 4,5:1) ở cả hai theme của Keystatic; chữ "Tốt / Cần cải thiện / Chưa đạt" đi kèm nên không chỉ dựa vào màu
const SEO_COLOR = {
  light: { good: "#1a7f37", warn: "#9a6700", bad: "#cf222e" },
  dark: { good: "#56d364", warn: "#e3b341", bad: "#ff7b72" },
} as const;

// Keystatic có nút chuyển Light / Dark riêng (không theo trình duyệt) nên đo độ sáng của nền trang để biết đang ở theme nào
function isDarkTheme() {
  const m = /\d+/g;
  const [r, g, b] = (getComputedStyle(document.body).backgroundColor.match(m) ?? ["255", "255", "255"]).map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}
let books: Record<string, string> = {};
let seo: Record<string, { score: number; level: SeoLevel }> = {};
let lastFetch = 0;
const REFRESH_MS = 10000; // sau khi lưu bài, điểm cũ được tải lại ở lần danh sách vẽ tiếp theo

function loadMaps() {
  if (Date.now() - lastFetch < 3000) return; // bài mới lưu chưa có trong bảng: tải lại, nhưng không dồn dập
  lastFetch = Date.now();
  const get = <T,>(url: string, set: (d: T) => void) =>
    fetch(url, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<T>) : null))
      .then((d) => {
        if (d) {
          set(d);
          schedule?.();
        }
      })
      .catch(() => {});
  get<Record<string, string>>("/api/ten-sach", (d) => (books = d));
  get<typeof seo>("/api/diem-seo", (d) => (seo = d));
}

// Cột "Điểm SEO": tìm cột theo tiêu đề, đổi tên, rồi vẽ điểm vào ô của từng hàng (ô nào cũng được tái sử dụng khi cuộn)
function fillSeo() {
  const header = [...document.querySelectorAll<HTMLElement>('main [role="columnheader"]')].find((h) =>
    (h.textContent ?? "").trim().startsWith(SEO_HEADER),
  );
  const renamed = document.querySelector<HTMLElement>(`main [${SEO_ATTR}="header"]`)?.closest<HTMLElement>('[role="columnheader"]');
  const head = header ?? renamed;
  if (!head) return;
  const col = head.getAttribute("aria-colindex");
  if (header) {
    for (const leaf of header.querySelectorAll<HTMLElement>("span, div")) {
      if (leaf.children.length === 0 && (leaf.textContent ?? "").trim().startsWith(SEO_HEADER)) {
        leaf.textContent = "Điểm SEO";
        leaf.setAttribute(SEO_ATTR, "header");
      }
    }
  }
  if (!col) return;
  const palette = SEO_COLOR[isDarkTheme() ? "dark" : "light"];
  for (const row of document.querySelectorAll<HTMLElement>('main [role="row"]')) {
    const cell = row.querySelector<HTMLElement>(`:is([role="gridcell"], [role="rowheader"])[aria-colindex="${col}"]`);
    if (!cell) continue;
    const slug = (row.getAttribute("data-key") ?? "").replace(/^key:/, "");
    const entry = seo[slug];
    let badge = cell.querySelector<HTMLElement>(`[${SEO_ATTR}="badge"]`);
    if (!entry) {
      badge?.remove();
      for (const c of cell.children) (c as HTMLElement).style.removeProperty("display");
      if (slug) loadMaps();
      continue;
    }
    if (!badge) {
      badge = document.createElement("span");
      badge.setAttribute(SEO_ATTR, "badge");
      cell.appendChild(badge);
    }
    for (const c of cell.children) if (c !== badge) (c as HTMLElement).style.display = "none";
    const text = `${entry.score} · ${SEO_LABEL[entry.level]}`;
    if (badge.textContent !== text) badge.textContent = text;
    badge.title = `Điểm SEO ${entry.score}/100. Mở bài để xem chi tiết từng tiêu chí.`;
    badge.style.cssText = `display:inline-block;font-weight:600;font-size:13px;white-space:nowrap;color:${palette[entry.level]}`;
  }
}

// Thay chữ "[object Object]" trong ô bằng tên sách của bài ở hàng đó (slug nằm ở một ô khác cùng hàng)
function fillBooks(row: HTMLElement) {
  const leaves = [...row.querySelectorAll<HTMLElement>("span, div")].filter((l) => l.children.length === 0);
  const slug = leaves.map((l) => l.textContent?.trim() ?? "").find((t) => t in books);
  for (const leaf of leaves) {
    const text = leaf.textContent?.trim() ?? "";
    if (text !== OBJECT_TEXT && !leaf.hasAttribute(BOOK_ATTR)) continue;
    if (slug) {
      leaf.textContent = books[slug];
      leaf.setAttribute(BOOK_ATTR, "");
    } else if (text === OBJECT_TEXT) {
      loadMaps();
    }
  }
}

function restore(leaf: HTMLElement) {
  leaf.style.removeProperty("display");
  const next = leaf.nextElementSibling;
  if (next?.hasAttribute(THUMB_ATTR)) next.remove();
}

function enhance() {
  fillSeo();
  if (Date.now() - lastFetch > REFRESH_MS && document.querySelector('main [role="row"]')) loadMaps();
  for (const row of document.querySelectorAll<HTMLElement>('main [role="row"]')) {
    fillBooks(row);
    // 1) ô đã có ảnh: giữ cho khớp với chữ hiện tại (ô được tái sử dụng khi cuộn / lọc)
    for (const img of row.querySelectorAll<HTMLImageElement>(`img[${THUMB_ATTR}]`)) {
      const leaf = img.previousElementSibling as HTMLElement | null;
      const path = leaf?.textContent?.trim() ?? "";
      if (!leaf || !IMAGE_PATH.test(path)) {
        img.remove();
        leaf?.style.removeProperty("display");
      } else if (img.getAttribute("src") !== path) {
        img.setAttribute("src", path);
        img.title = path;
      }
    }
    // 2) ô chứa đường dẫn ảnh mà chưa có ảnh: thêm ảnh, ẩn chữ
    for (const leaf of row.querySelectorAll<HTMLElement>("span, div")) {
      if (leaf.children.length > 0) continue;
      const path = leaf.textContent?.trim() ?? "";
      if (!IMAGE_PATH.test(path)) continue;
      if (leaf.nextElementSibling?.hasAttribute(THUMB_ATTR)) continue;
      const img = document.createElement("img");
      img.setAttribute(THUMB_ATTR, "");
      img.src = path;
      img.alt = "";
      img.title = path;
      img.loading = "lazy";
      img.style.cssText = `display:block;height:${HEIGHT}px;width:auto;max-width:72px;object-fit:contain;border-radius:4px`;
      img.addEventListener("error", () => {
        img.remove(); // ảnh hỏng: hiện lại đường dẫn chữ để còn biết đường sửa
        leaf.style.removeProperty("display");
      });
      leaf.style.display = "none";
      leaf.after(img);
    }
  }
}

let schedule: (() => void) | null = null;

export function KeystaticThumbnails() {
  useEffect(() => {
    let frame = 0;
    schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(enhance);
    };
    // Bỏ qua thay đổi do chính mình gây ra (thêm / bỏ thẻ ảnh) để khỏi lặp vô hạn
    const own = (n: Node) => n instanceof HTMLElement && n.hasAttribute(THUMB_ATTR);
    const observer = new MutationObserver((mutations) => {
      const external = mutations.some(
        (m) => m.type === "characterData" || [...m.addedNodes, ...m.removedNodes].some((n) => !own(n)),
      );
      if (external) schedule?.();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    // đổi theme Light / Dark của Keystatic chỉ đổi thuộc tính ở <html> / <body>: vẽ lại màu điểm SEO
    const themeObserver = new MutationObserver(() => schedule?.());
    for (const el of [document.documentElement, document.body]) {
      themeObserver.observe(el, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    }
    schedule();
    return () => {
      schedule = null;
      observer.disconnect();
      themeObserver.disconnect();
      cancelAnimationFrame(frame);
      // trả lại trang như cũ khi rời khỏi /keystatic
      for (const img of document.querySelectorAll<HTMLElement>(`img[${THUMB_ATTR}]`)) {
        const leaf = img.previousElementSibling as HTMLElement | null;
        if (leaf) restore(leaf);
        else img.remove();
      }
    };
  }, []);

  return null;
}
