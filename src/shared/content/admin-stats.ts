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
      posts[f.slice(0, -3)] = {
        topicName: topics[category]?.name ?? category,
        subtopicNames: subs.map((s) => subtopics[s]?.name ?? s),
      };
    } catch {
      /* bỏ qua file lỗi */
    }
  }
  return { topics, subtopics, posts };
}
