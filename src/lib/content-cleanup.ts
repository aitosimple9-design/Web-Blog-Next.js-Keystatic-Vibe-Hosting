// Dọn ảnh khi xóa nội dung trong Keystatic (chế độ local).
// Keystatic chỉ xóa file nội dung (.md / .json), KHÔNG xóa thư mục ảnh của mục đó → ảnh mồ côi.
// Route /api/keystatic/update dùng hàm này để xóa luôn thư mục ảnh theo slug. Chỉ chạy phía server.
// Chế độ GitHub: trình duyệt gửi lệnh xóa thẳng lên GitHub, máy chủ không chen vào được → dùng `npm run prune-images`.

import fs from "node:fs/promises";
import path from "node:path";

/** file nội dung → thư mục ảnh (cùng slug) */
export const IMAGE_RULES = [
  { contentDir: "content/posts/", ext: ".md", imageDir: "public/images/posts" },
  { contentDir: "content/topics/", ext: ".json", imageDir: "public/images/topics" },
  { contentDir: "content/books/", ext: ".json", imageDir: "public/images/covers" },
] as const;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Update = { additions?: { path: string }[]; deletions?: { path: string }[] };

/**
 * Từ một lệnh cập nhật của Keystatic, trả về các thư mục ảnh cần xóa:
 * mục nào bị xóa file nội dung thì thư mục ảnh cùng slug bị xóa, TRỪ khi chính lệnh này đang ghi file mới vào thư mục đó
 * (đổi slug: ảnh được ghi lại sang thư mục mới, thư mục cũ mới xóa).
 */
export function imageFoldersToRemove(update: Update): string[] {
  const adds = (update.additions ?? []).map((a) => a.path.replace(/\\/g, "/"));
  const out = new Set<string>();
  for (const d of update.deletions ?? []) {
    const p = d.path.replace(/\\/g, "/");
    for (const r of IMAGE_RULES) {
      if (!p.startsWith(r.contentDir) || !p.endsWith(r.ext)) continue;
      const slug = p.slice(r.contentDir.length, p.length - r.ext.length);
      if (!SLUG.test(slug)) continue;
      const folder = `${r.imageDir}/${slug}`;
      if (adds.some((a) => a.startsWith(`${folder}/`))) continue;
      out.add(folder);
    }
  }
  return [...out];
}

export async function removeImageFolders(folders: string[], root = process.cwd()) {
  const base = path.resolve(root, "public", "images");
  for (const f of folders) {
    const abs = path.resolve(root, f);
    if (!abs.startsWith(base + path.sep)) continue; // chỉ xóa bên trong public/images
    await fs.rm(abs, { recursive: true, force: true });
  }
}
