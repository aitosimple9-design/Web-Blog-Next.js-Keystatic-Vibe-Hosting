// Dọn ảnh khi xóa / thay nội dung trong Keystatic (chế độ local). NGUYÊN TẮC (Lộc, 2026-10-16): thêm / xóa gì trong trang quản trị
// thì file đi kèm phải đồng bộ theo: xóa thì mất hết file liên quan, không để ảnh mồ côi.
// Keystatic chỉ xóa file nội dung (.md / .json), KHÔNG xóa thư mục ảnh của mục đó, và thay / gỡ ảnh thì file ảnh cũ vẫn nằm lại → ảnh mồ côi.
// Route /api/keystatic/update dùng các hàm này: xóa thư mục ảnh theo slug, rồi quét ảnh mồ côi từng file (`removeOrphanImages`). Chỉ chạy phía server.
// Chế độ GitHub: trình duyệt gửi lệnh xóa thẳng lên GitHub, máy chủ không chen vào được → dùng `npm run prune-images`.
// scripts/prune-orphan-images.mjs và scripts/check-content.mjs ĐỌC THẲNG file này (Node >= 22.18), nên quy tắc chỉ có MỘT nơi.
// Thêm ô ảnh mới vào keystatic.config.ts (thư mục ảnh mới) thì PHẢI khai báo ở đây; tests/unit/admin-sync.test.ts chặn việc quên.

import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

/** file nội dung → thư mục ảnh (cùng slug) */
export const IMAGE_RULES = [
  { contentDir: "content/posts/", ext: ".md", imageDir: "public/images/posts" },
  { contentDir: "content/topics/", ext: ".json", imageDir: "public/images/topics" },
  { contentDir: "content/books/", ext: ".json", imageDir: "public/images/covers" },
] as const;

/** Ảnh của các singleton ở "Cài đặt" (ảnh chia sẻ, logo...): file nằm phẳng trong thư mục, được nhắc tới trong bất kỳ content/settings/*.json */
export const SINGLETON_IMAGE_RULE = { contentDir: "content/settings", ext: ".json", imageDir: "public/images/site" } as const;

/** Mọi thư mục ảnh mà trang quản trị ghi vào; mỗi `directory` của `fields.image` trong keystatic.config.ts phải nằm trong danh sách này */
export const MANAGED_IMAGE_DIRS: string[] = [...IMAGE_RULES.map((r) => r.imageDir), SINGLETON_IMAGE_RULE.imageDir];

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

/** Một ảnh / thư mục ảnh không còn thuộc về nội dung nào trong trang quản trị */
export type OrphanImage = { path: string; kind: "folder" | "file" };

const listDir = (abs: string) => {
  try {
    return fsSync.readdirSync(abs, { withFileTypes: true });
  } catch {
    return [];
  }
};
const readText = (abs: string) => {
  try {
    return fsSync.readFileSync(abs, "utf8");
  } catch {
    return null;
  }
};
// Đường dẫn công khai của một file ảnh (bỏ tiền tố "public"), thử cả dạng đã mã hóa URL
const mentioned = (text: string, publicPath: string) => text.includes(publicPath) || text.includes(encodeURI(publicPath));

/**
 * Tìm ảnh mồ côi:
 *  - thư mục ảnh theo slug mà bài / chủ đề / sách tương ứng không còn → cả thư mục;
 *  - file ảnh trong thư mục của một mục còn tồn tại nhưng nội dung của mục đó không nhắc tới (đã thay / gỡ ảnh);
 *  - file trong public/images/site mà không file content/settings/*.json nào nhắc tới.
 * An toàn: một file chỉ bị coi là mồ côi khi đường dẫn công khai của nó không xuất hiện trong nội dung chủ.
 */
export function findOrphanImages(root = process.cwd()): OrphanImage[] {
  const out: OrphanImage[] = [];
  for (const r of IMAGE_RULES) {
    const imgRoot = path.resolve(root, r.imageDir);
    const publicBase = r.imageDir.replace(/^public/, "");
    for (const d of listDir(imgRoot)) {
      if (!d.isDirectory()) continue;
      const text = readText(path.resolve(root, r.contentDir, d.name + r.ext));
      if (text === null) {
        out.push({ path: `${r.imageDir}/${d.name}`, kind: "folder" });
        continue;
      }
      for (const f of listDir(path.join(imgRoot, d.name))) {
        if (f.isFile() && !mentioned(text, `${publicBase}/${d.name}/${f.name}`)) {
          out.push({ path: `${r.imageDir}/${d.name}/${f.name}`, kind: "file" });
        }
      }
    }
  }
  const settingsText = listDir(path.resolve(root, SINGLETON_IMAGE_RULE.contentDir))
    .filter((f) => f.isFile() && f.name.endsWith(SINGLETON_IMAGE_RULE.ext))
    .map((f) => readText(path.resolve(root, SINGLETON_IMAGE_RULE.contentDir, f.name)) ?? "")
    .join("\n");
  const siteBase = SINGLETON_IMAGE_RULE.imageDir.replace(/^public/, "");
  for (const f of listDir(path.resolve(root, SINGLETON_IMAGE_RULE.imageDir))) {
    if (f.isFile() && !mentioned(settingsText, `${siteBase}/${f.name}`)) {
      out.push({ path: `${SINGLETON_IMAGE_RULE.imageDir}/${f.name}`, kind: "file" });
    }
  }
  return out;
}

/** Xóa ảnh mồ côi (chỉ bên trong public/images); trả về danh sách đã xóa */
export async function removeOrphanImages(root = process.cwd()): Promise<OrphanImage[]> {
  const orphans = findOrphanImages(root);
  await removeImageFolders(orphans.map((o) => o.path), root);
  return orphans;
}
