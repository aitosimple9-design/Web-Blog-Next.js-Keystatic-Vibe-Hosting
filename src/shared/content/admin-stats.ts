// Số liệu cho các cột của danh sách quản trị Keystatic (Chủ đề, Chủ đề con, Bài viết): số chủ đề con, số bài, tên thay cho slug.
// Đọc LỎNG thẳng từ content/ (bài nháp, bài lên lịch cũng được đếm: đây là số liệu cho người soạn bài, không phải số trên web công khai);
// file lỗi thì bỏ qua, không bao giờ ném lỗi. Chỉ chạy phía server; /api/thong-ke trả ra cho trình duyệt (cùng cổng quản trị viên).

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type AdminStats = {
  topics: Record<string, { name: string; subtopics: number; posts: number }>;
  subtopics: Record<string, { name: string; topic: string; topicName: string; posts: number }>;
  /** Theo slug bài: tên chủ đề và tên các chủ đề con (thay cho slug ở cột danh sách bài) */
  posts: Record<string, { topicName: string; subtopicNames: string[] }>;
  /** Theo slug sách: tên và số bài ghi "Tên sách" đúng tên đó (cảnh báo trước khi xóa sách) */
  books: Record<string, { name: string; posts: number }>;
  /** Số bìa ở Tủ sách Trang chủ (content/pages/trang-chu.json) trỏ tới từng chủ đề / sách theo slug */
  shelf: { topics: Record<string, number>; books: Record<string, number> };
};

const readDir = (dir: string, ext: string) => {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(ext));
  } catch {
    return [];
  }
};

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map(text).filter(Boolean) : []);

export function getAdminStats(root = process.cwd()): AdminStats {
  const topics: AdminStats["topics"] = {};
  const subtopics: AdminStats["subtopics"] = {};
  const posts: AdminStats["posts"] = {};
  const books: AdminStats["books"] = {};
  const shelf: AdminStats["shelf"] = { topics: {}, books: {} };

  for (const f of readDir(path.join(root, "content", "books"), ".json")) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(root, "content", "books", f), "utf8")) as Record<string, unknown>;
      books[f.slice(0, -5)] = { name: text(j.name) || f.slice(0, -5), posts: 0 };
    } catch {
      /* bỏ qua file lỗi */
    }
  }
  try {
    const home = JSON.parse(fs.readFileSync(path.join(root, "content", "pages", "trang-chu.json"), "utf8")) as { shelf?: { books?: unknown } };
    for (const b of Array.isArray(home.shelf?.books) ? home.shelf.books : []) {
      const r = (b ?? {}) as Record<string, unknown>;
      if (text(r.topic)) shelf.topics[text(r.topic)] = (shelf.topics[text(r.topic)] ?? 0) + 1;
      if (text(r.book)) shelf.books[text(r.book)] = (shelf.books[text(r.book)] ?? 0) + 1;
    }
  } catch {
    /* chưa có / hỏng file Trang chủ: không có tủ sách */
  }

  for (const f of readDir(path.join(root, "content", "topics"), ".json")) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(root, "content", "topics", f), "utf8")) as Record<string, unknown>;
      topics[f.slice(0, -5)] = { name: text(j.name) || f.slice(0, -5), subtopics: 0, posts: 0 };
    } catch {
      /* bỏ qua file lỗi */
    }
  }
  for (const f of readDir(path.join(root, "content", "subtopics"), ".json")) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(root, "content", "subtopics", f), "utf8")) as Record<string, unknown>;
      const slug = f.slice(0, -5);
      const topic = text(j.topic);
      subtopics[slug] = { name: text(j.name) || slug, topic, topicName: topics[topic]?.name ?? topic, posts: 0 };
      if (topics[topic]) topics[topic].subtopics++;
    } catch {
      /* bỏ qua file lỗi */
    }
  }
  for (const f of readDir(path.join(root, "content", "posts"), ".md")) {
    try {
      const { data } = matter(fs.readFileSync(path.join(root, "content", "posts", f), "utf8"));
      const category = text(data.category);
      const subs = [...new Set(list(data.subtopics))];
      if (topics[category]) topics[category].posts++;
      for (const s of subs) if (subtopics[s]) subtopics[s].posts++;
      const bookName = text((data.source as Record<string, unknown> | undefined)?.book);
      for (const b of Object.values(books)) if (bookName && b.name === bookName) b.posts++;
      posts[f.slice(0, -3)] = {
        topicName: topics[category]?.name ?? category,
        subtopicNames: subs.map((s) => subtopics[s]?.name ?? s),
      };
    } catch {
      /* bỏ qua file lỗi */
    }
  }
  return { topics, subtopics, posts, books, shelf };
}
