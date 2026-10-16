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

/**
 * Ảnh của các singleton: file nằm phẳng trong thư mục ảnh, được nhắc tới trong BẤT KỲ file .json nào của `contentDir`.
 *  - "Cài đặt" (ảnh chia sẻ, logo...): content/settings → public/images/site
 *  - "Trang" (chân dung, ảnh Câu chuyện...): content/pages → public/images/profile
 */
export const SINGLETON_IMAGE_RULES = [
  { contentDir: "content/settings", ext: ".json", imageDir: "public/images/site" },
  { contentDir: "content/pages", ext: ".json", imageDir: "public/images/profile" },
] as const;

/**
 * Ảnh MẶC ĐỊNH mà mã dùng khi ô ảnh trong admin để trống (src/config/profile.ts). Không file .json nào nhắc tới chúng nên nếu không bảo vệ,
 * gỡ ảnh trong admin sẽ làm quét ảnh mồ côi xóa luôn ảnh mặc định → trang vỡ ảnh. tests/unit/admin-sync.test.ts bắt buộc khớp với profile.ts.
 */
export const PROTECTED_IMAGES: string[] = ["/images/profile/portrait-cutout.webp", "/images/profile/story.jpg"];

/** Mọi thư mục ảnh mà trang quản trị ghi vào; mỗi `directory` của `fields.image` trong keystatic.config.ts phải nằm trong danh sách này */
export const MANAGED_IMAGE_DIRS: string[] = [...IMAGE_RULES.map((r) => r.imageDir), ...SINGLETON_IMAGE_RULES.map((r) => r.imageDir)];

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
 *  - file trong thư mục ảnh của singleton (public/images/site, public/images/profile) mà không file .json nào của thư mục nội dung tương ứng nhắc tới.
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
  for (const r of SINGLETON_IMAGE_RULES) {
    const jsonText = listDir(path.resolve(root, r.contentDir))
      .filter((f) => f.isFile() && f.name.endsWith(r.ext))
      .map((f) => readText(path.resolve(root, r.contentDir, f.name)) ?? "")
      .join("\n");
    const base = r.imageDir.replace(/^public/, "");
    for (const f of listDir(path.resolve(root, r.imageDir))) {
      if (f.isFile() && !PROTECTED_IMAGES.includes(`${base}/${f.name}`) && !mentioned(jsonText, `${base}/${f.name}`)) {
        out.push({ path: `${r.imageDir}/${f.name}`, kind: "file" });
      }
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

/**
 * Xóa sách / chủ đề trong admin thì Trang chủ không được giữ tham chiếu treo (Keystatic không tự gỡ relationship):
 * mục tủ sách trỏ tới sách đã xóa bị gỡ; chủ đề đã xóa thì bỏ liên kết chủ đề của mục đó (bìa vẫn hiện, không bấm được).
 * Trả về true nếu đã sửa file.
 */
export function removeHomeReferences(update: Update, root = process.cwd()): boolean {
  const gone = { books: new Set<string>(), topics: new Set<string>() };
  for (const d of update.deletions ?? []) {
    const m = /^content\/(books|topics)\/([^/]+)\.json$/.exec(d.path.replace(/\\/g, "/"));
    if (m && SLUG.test(m[2])) gone[m[1] as "books" | "topics"].add(m[2]);
  }
  if (gone.books.size === 0 && gone.topics.size === 0) return false;
  const file = path.resolve(root, "content", "pages", "trang-chu.json");
  const text = readText(file);
  if (text === null) return false;
  let data: { shelf?: { books?: { book?: string | null; topic?: string | null }[] } };
  try {
    data = JSON.parse(text);
  } catch {
    return false;
  }
  const books = data.shelf?.books;
  if (!Array.isArray(books)) return false;
  let changed = false;
  const kept = books.filter((b) => {
    const drop = typeof b?.book === "string" && gone.books.has(b.book);
    if (drop) changed = true;
    return !drop;
  });
  for (const b of kept) {
    if (typeof b?.topic === "string" && gone.topics.has(b.topic)) {
      b.topic = null;
      changed = true;
    }
  }
  if (!changed) return false;
  data.shelf!.books = kept;
  fsSync.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  return true;
}
