// Hai trang chữ: Chính sách riêng tư (/chinh-sach-rieng-tu) và Liên hệ (/lien-he). Soạn ở Keystatic (Trang → Chính sách riêng tư / Liên hệ),
// lưu ở content/pages/<tên>.md (frontmatter + thân Markdown). TRANG TRỐNG THÌ ẨN: không có trên web (404), không vào sitemap, không có liên kết ở chân trang.
// Chỉ chạy phía server. Chữ lấy từ admin; chỉ vài nhãn giao diện nhỏ ("Cập nhật lần cuối", "Email") nằm trong mã (đã duyệt giữ trong mã).

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { renderMarkdown } from "@/shared/content/posts";

export type LegalPageId = "privacy" | "contact";

export const LEGAL_PAGES: Record<LegalPageId, { file: string; href: string; defaultTitle: string; match: RegExp }> = {
  privacy: { file: "chinh-sach-rieng-tu", href: "/chinh-sach-rieng-tu", defaultTitle: "Chính sách riêng tư", match: /chính sách|riêng tư/i },
  contact: { file: "lien-he", href: "/lien-he", defaultTitle: "Liên hệ", match: /liên hệ/i },
};
export const LEGAL_IDS = Object.keys(LEGAL_PAGES) as LegalPageId[];

const text = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined);
const dateStr = (v: unknown) => (v instanceof Date && !Number.isNaN(v.getTime()) ? v.toISOString().slice(0, 10) : text(v));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LegalPageData = {
  id: LegalPageId;
  title: string;
  description?: string;
  /** Ngày cập nhật lần cuối (YYYY-MM-DD), có thể không có */
  updated?: string;
  /** Chỉ trang Liên hệ */
  email?: string;
  /** Thân Markdown (chưa dựng HTML) */
  body: string;
};

/** Đọc trang (chưa dựng HTML); null = ẨN (chưa có file hoặc chưa có chữ). Trang Liên hệ hiện khi có chữ HOẶC có email. */
export function readLegalPage(id: LegalPageId, root: string = process.cwd()): LegalPageData | null {
  const def = LEGAL_PAGES[id];
  let raw: string;
  try {
    raw = fs.readFileSync(path.join(root, "content", "pages", `${def.file}.md`), "utf8");
  } catch {
    return null;
  }
  let data: Record<string, unknown>;
  let body: string;
  try {
    ({ data, content: body } = matter(raw));
  } catch {
    return null;
  }
  const email = id === "contact" ? text(data.email) : undefined;
  body = body.trim();
  if (!body && !(email && EMAIL.test(email))) return null;
  return {
    id,
    title: text(data.title) ?? def.defaultTitle,
    description: text(data.description),
    updated: dateStr(data.updated),
    email: email && EMAIL.test(email) ? email : undefined,
    body,
  };
}

/** Trang kèm HTML đã dựng (an toàn: HTML thô trong Markdown bị bỏ); null = ẩn */
export const getLegalPage = cache(async (id: LegalPageId) => {
  const page = readLegalPage(id);
  if (!page) return null;
  return { ...page, html: page.body ? (await renderMarkdown(page.body)).html : "" };
});

/** Các trang đang hiện (cho chân trang và sitemap) */
export const getVisibleLegalPages = cache(() =>
  LEGAL_IDS.flatMap((id) => {
    const p = readLegalPage(id);
    return p ? [{ id, href: LEGAL_PAGES[id].href, title: p.title }] : [];
  }),
);

/**
 * Liên kết pháp lý ở chân trang = các liên kết admin tự đặt (Cài đặt site → Trang pháp lý) + các trang đang hiện:
 * liên kết admin chưa có địa chỉ mà nhãn khớp một trang đang hiện (vd. "Chính sách") được nối vào trang đó; trang chưa có liên kết nào thì thêm cuối.
 */
export function resolveLegalLinks(
  admin: { label: string; href: string }[],
  pages: { href: string; title: string }[],
): { label: string; href: string }[] {
  const used = new Set<string>();
  const out = admin.map((l) => {
    if (l.href) return l;
    const page = pages.find((p) => !used.has(p.href) && LEGAL_IDS.some((id) => LEGAL_PAGES[id].href === p.href && LEGAL_PAGES[id].match.test(l.label)));
    if (!page) return l;
    used.add(page.href);
    return { label: l.label, href: page.href };
  });
  for (const p of pages) if (!used.has(p.href) && !out.some((l) => l.href === p.href)) out.push({ label: p.title, href: p.href });
  return out;
}
