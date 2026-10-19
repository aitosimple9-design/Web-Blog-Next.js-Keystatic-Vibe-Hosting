// Bìa sách — đọc từ content/books/*.json (Keystatic: menu "Sách"). Chỉ chạy phía server.
// `name` phải khớp trường `source.book` trong content/posts/*.md; sách không có ở đây dùng `CoverArt` sinh tự động.

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

const DIR = path.join(process.cwd(), "content", "books");

const loadCovers = cache((): Record<string, string> => {
  const map: Record<string, string> = {};
  let files: string[] = [];
  try {
    files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return map;
  }
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")) as Record<string, unknown>;
      if (typeof raw.name === "string" && typeof raw.cover === "string" && raw.cover) {
        map[raw.name.trim()] = raw.cover;
      }
    } catch {
      // file hỏng → bỏ qua
    }
  }
  return map;
});

export const getBookCover = (title?: string) => (title ? loadCovers()[title] : undefined);
