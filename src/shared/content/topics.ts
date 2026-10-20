// Danh mục (chủ đề) — đọc từ content/topics/*.json (Keystatic: menu "Chủ đề"). Chỉ chạy phía server.
// Tên file (không có .json) là `slug`: khớp trường `category` trong content/posts/*.md và là URL /blog/<slug>.
// Thiếu / sai file thì bỏ qua file đó, không làm site lỗi.

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

export type Topic = {
  slug: string;
  name: string;
  description: string;
  /** Ảnh nền của thẻ chủ đề (trang chủ) và Hero trang Blog, đường dẫn trong public/ */
  image: string;
};

const DIR = path.join(process.cwd(), "content", "topics");

/** Một chủ đề từ nội dung JSON thô (null nếu hỏng / thiếu tên). `order` chỉ để sắp xếp. */
export function topicFromJson(slug: string, text: string): (Topic & { order: number }) | null {
  try {
    const raw = JSON.parse(text) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const name = str(raw.name);
    if (!name) return null;
    return {
      slug,
      name,
      description: str(raw.description),
      image: str(raw.image),
      order: typeof raw.order === "number" ? raw.order : Number.MAX_SAFE_INTEGER,
    };
  } catch {
    return null;
  }
}

const loadTopics = cache((): Topic[] => {
  let files: string[] = [];
  try {
    files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const rows: (Topic & { order: number })[] = [];
  for (const file of files) {
    try {
      const row = topicFromJson(file.replace(/\.json$/, ""), fs.readFileSync(path.join(DIR, file), "utf8"));
      if (row) rows.push(row);
    } catch {
      // file hỏng → bỏ qua
    }
  }
  rows.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  return rows.map(({ order: _order, ...t }) => { void _order; return t; });
});

export const getTopics = () => loadTopics();
// Chủ đề chỉ có ở NHÁNH đang soạn (chưa merge nên chưa có trong bản build): trang xem trước của quản trị đăng ký vào đây để dựng được bài.
// Dùng React `cache` nên chỉ sống trong MỘT yêu cầu, không rò sang yêu cầu khác hay trang công khai.
const previewTopics = cache(() => new Map<string, Topic>());
export function registerPreviewTopic(topic: Topic): void {
  previewTopics().set(topic.slug, topic);
}

export const topicBySlug = (slug: string) => loadTopics().find((t) => t.slug === slug) ?? previewTopics().get(slug);
