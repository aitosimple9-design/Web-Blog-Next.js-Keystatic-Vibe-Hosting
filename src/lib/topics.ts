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
      const raw = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")) as Record<string, unknown>;
      const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
      const name = str(raw.name);
      if (!name) continue;
      rows.push({
        slug: file.replace(/\.json$/, ""),
        name,
        description: str(raw.description),
        image: str(raw.image),
        order: typeof raw.order === "number" ? raw.order : Number.MAX_SAFE_INTEGER,
      });
    } catch {
      // file hỏng → bỏ qua
    }
  }
  rows.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  return rows.map(({ order: _order, ...t }) => { void _order; return t; });
});

export const getTopics = () => loadTopics();
export const topicBySlug = (slug: string) => loadTopics().find((t) => t.slug === slug);
