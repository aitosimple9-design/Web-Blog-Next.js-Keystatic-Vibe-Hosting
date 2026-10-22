"use client";

// Trang quản trị Keystatic: trong các danh sách (Bài viết, Chủ đề, Sách), cột ảnh chỉ hiện ĐƯỜNG DẪN chữ vì Keystatic không có
// cột kiểu ảnh. Component này thay đường dẫn ảnh (/images/....jpg) trong ô bằng ảnh thu nhỏ.
// Chỉ sửa HIỂN THỊ ở trình duyệt, không đụng dữ liệu. Chỉ chạy dưới /keystatic (gắn ở layout.tsx cùng thư mục).
// Cột "Nguồn sách" của danh sách Bài viết: Keystatic không đọc được khối lồng nên ô hiện "[object Object]"; thay bằng tên sách lấy từ /api/ten-sach.
// Cột "SEO" của danh sách Bài viết: Keystatic không có cột tính toán nên mượn cột "Từ khóa chính" làm chỗ giữ chỗ, đổi tiêu đề thành
// "Điểm SEO" và vẽ điểm (số + chữ Tốt / Cần cải thiện / Chưa đạt, không chỉ màu) lấy từ /api/diem-seo (src/lib/seo-score.ts).
// Cột đếm và cột tên (Lộc yêu cầu 2026-10-22), số liệu lấy từ /api/thong-ke: danh sách Chủ đề có "Số chủ đề con", "Số bài viết"; Chủ đề con có "Số bài viết"
// và cột Chủ đề hiện TÊN; Bài viết hiện TÊN chủ đề và các chủ đề con (thay cho slug). Hai cột đếm là ô giữ chỗ `fields.empty()` trong keystatic.config.ts
// (không lưu gì vào file); tiêu đề cột "Empty" được đổi tên theo khóa cột (`data-key` của ô tiêu đề). Số bài đếm CẢ bài nháp / lên lịch.
// Danh sách của Keystatic được "ảo hóa" (hàng được tái sử dụng khi cuộn / lọc) nên phải cập nhật lại mỗi khi DOM đổi.
import { useEffect } from "react";
import { SEO_LABEL, isDarkTheme, seoPalette, type SeoLevel } from "./ks-theme";

const IMAGE_PATH = /^\/images\/\S+\.(?:jpe?g|png|webp|gif|svg|avif)$/i;
const THUMB_ATTR = "data-ks-thumb";
const HEIGHT = 32; // hàng danh sách cao 45px

const OBJECT_TEXT = "[object Object]";
const BOOK_ATTR = "data-ks-book";
const SEO_ATTR = "data-ks-seo";
type StatsData = {
  topics: Record<string, { name: string; subtopics: number; posts: number }>;
  subtopics: Record<string, { name: string; topic: string; topicName: string; posts: number }>;
  posts: Record<string, { topicName: string; subtopicNames: string[] }>;
};
const SEO_HEADER = "Từ khóa chính"; // nhãn của ô chọn làm chỗ giữ chỗ (keystatic.config.ts, cột "focusKeyword")
let books: Record<string, string> = {};
let seo: Record<string, { score: number; level: SeoLevel }> = {};
let stats: StatsData | null = null;
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
  get<StatsData>("/api/thong-ke", (d) => (stats = d));
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
  const palette = seoPalette(isDarkTheme());
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

// Cột đếm / cột tên: tiêu đề đổi theo khóa cột, ô điền theo hàng. Collection lấy từ địa chỉ (/keystatic/[branch/<nhánh>/]collection/<id>).
const HEADERS: Record<string, Record<string, string>> = {
  topics: { subtopicCount: "Số chủ đề con", postCount: "Số bài viết" },
  subtopics: { postCount: "Số bài viết" },
  posts: { subtopics: "Chủ đề con" },
};
function statValue(collection: string, col: string, slug: string): string | null {
  if (!stats) return null;
  if (collection === "topics") {
    const t = stats.topics[slug];
    if (!t) return null;
    return col === "subtopicCount" ? String(t.subtopics) : col === "postCount" ? String(t.posts) : null;
  }
  if (collection === "subtopics") {
    const s = stats.subtopics[slug];
    if (!s) return null;
    return col === "postCount" ? String(s.posts) : col === "topic" ? s.topicName : null;
  }
  if (collection === "posts") {
    const p = stats.posts[slug];
    if (!p) return null;
    return col === "category" ? p.topicName : col === "subtopics" ? p.subtopicNames.join(", ") : null;
  }
  return null;
}
function setLeaf(cell: HTMLElement, value: string) {
  const leaf = [...cell.querySelectorAll<HTMLElement>("span, div")].filter((l) => l.children.length === 0).pop();
  if (!leaf) return;
  if (leaf.textContent !== value) leaf.textContent = value;
  if (leaf.title !== value) leaf.title = value;
}
function fillStats() {
  const collection = /\/collection\/([^/]+)\/?$/.exec(location.pathname)?.[1];
  if (!collection || !(collection in HEADERS)) return;
  for (const head of document.querySelectorAll<HTMLElement>('main [role="columnheader"]')) {
    const label = HEADERS[collection][head.getAttribute("data-key") ?? ""];
    if (!label) continue;
    for (const leaf of head.querySelectorAll<HTMLElement>("span")) {
      if (leaf.children.length === 0 && leaf.textContent !== label) {
        leaf.textContent = label;
        leaf.title = label;
      }
    }
  }
  const cols = Object.keys(collection === "topics" ? { subtopicCount: 1, postCount: 1 } : collection === "subtopics" ? { postCount: 1, topic: 1 } : { category: 1, subtopics: 1 });
  for (const row of document.querySelectorAll<HTMLElement>('main [role="row"][data-key]')) {
    const slug = (row.getAttribute("data-key") ?? "").replace(/^key:/, "");
    for (const col of cols) {
      const cell = row.querySelector<HTMLElement>(`[data-key="${col}${slug}"]`);
      if (!cell) continue;
      const value = statValue(collection, col, slug);
      if (value === null) {
        if (!stats) loadMaps();
        continue;
      }
      setLeaf(cell, value);
    }
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
  fillStats();
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
    let timer = 0;
    schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(enhance, 30); // setTimeout thay vì requestAnimationFrame: tab chạy nền không bị treo (đã gặp: cột SEO không hiện ở tab nền)
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
      clearTimeout(timer);
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
