// Chủ đề con — đọc từ content/subtopics/*.json (Keystatic: menu "Chủ đề con"). Chỉ chạy phía server.
// Cấp bậc: Chủ đề (content/topics) → Chủ đề con (file này) → Bài viết. Tên file (không có .json) là `slug`, duy nhất toàn site;
// trường `topic` là slug chủ đề lớn. URL công khai: /blog/<chu-de>/<chu-de-con>. Bài trỏ tới chủ đề con qua `subtopics` (nhiều lựa chọn).
// Thiếu / sai file thì bỏ qua file đó, không làm site lỗi.

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

export type Subtopic = {
  slug: string;
  name: string;
  /** Slug chủ đề lớn (tên file trong content/topics) */
  topic: string;
  description: string;
  /** Ảnh thẻ chủ đề con (tùy chọn), đường dẫn trong public/; trống thì dùng ảnh sinh tự động */
  image: string;
};

/** Các slug không được dùng cho chủ đề con vì đã là đoạn đường dẫn có sẵn dưới /blog/<chu-de>/ */
export const RESERVED_SUBTOPIC_SLUGS: readonly string[] = ["trang"];

const DIR = path.join(process.cwd(), "content", "subtopics");

/** Một chủ đề con từ nội dung JSON thô (null nếu hỏng / thiếu tên / thiếu chủ đề lớn). `order` chỉ để sắp xếp. */
export function subtopicFromJson(slug: string, text: string): (Subtopic & { order: number }) | null {
  try {
    const raw = JSON.parse(text) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const name = str(raw.name);
    const topic = str(raw.topic);
    if (!name || !topic) return null;
    return {
      slug,
      name,
      topic,
      description: str(raw.description),
      image: str(raw.image),
      order: typeof raw.order === "number" ? raw.order : Number.MAX_SAFE_INTEGER,
    };
  } catch {
    return null;
  }
}

const loadSubtopics = cache((): Subtopic[] => {
  let files: string[] = [];
  try {
    files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const rows: (Subtopic & { order: number })[] = [];
  for (const file of files) {
    try {
      const row = subtopicFromJson(file.replace(/\.json$/, ""), fs.readFileSync(path.join(DIR, file), "utf8"));
      if (row) rows.push(row);
    } catch {
      // file hỏng → bỏ qua
    }
  }
  rows.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  return rows.map(({ order: _order, ...s }) => { void _order; return s; });
});

export const getSubtopics = () => loadSubtopics();

// Chủ đề con chỉ có ở NHÁNH đang soạn (chưa merge nên chưa có trong bản build): trang xem trước của quản trị đăng ký vào đây để dựng được bài.
// Dùng React `cache` nên chỉ sống trong MỘT yêu cầu, không rò sang yêu cầu khác hay trang công khai.
const previewSubtopics = cache(() => new Map<string, Subtopic>());
export function registerPreviewSubtopic(subtopic: Subtopic): void {
  previewSubtopics().set(subtopic.slug, subtopic);
}

export const subtopicBySlug = (slug: string) => loadSubtopics().find((s) => s.slug === slug) ?? previewSubtopics().get(slug);

/** Chủ đề con của một chủ đề lớn, theo thứ tự hiển thị */
export const getSubtopicsByTopic = (topicSlug: string): Subtopic[] => loadSubtopics().filter((s) => s.topic === topicSlug);
