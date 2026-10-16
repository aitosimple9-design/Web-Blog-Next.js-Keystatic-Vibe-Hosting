// Tìm (và xóa) thư mục ảnh MỒ CÔI: thư mục ảnh theo slug mà không còn bài / chủ đề / sách tương ứng.
// Keystatic xóa file nội dung nhưng để lại ảnh. Chế độ local đã tự dọn qua route API; chế độ GitHub thì chạy script này.
// Chạy: npm run prune-images           (chỉ liệt kê)
//       npm run prune-images -- --delete  (xóa thật)
// Quy tắc phải khớp src/lib/content-cleanup.ts (IMAGE_RULES).
import { existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rules = [
  { contentDir: "content/posts", ext: ".md", imageDir: "public/images/posts" },
  { contentDir: "content/topics", ext: ".json", imageDir: "public/images/topics" },
  { contentDir: "content/books", ext: ".json", imageDir: "public/images/covers" },
];
const doDelete = process.argv.includes("--delete");

let orphans = 0;
for (const r of rules) {
  const imgRoot = resolve(root, r.imageDir);
  if (!existsSync(imgRoot)) continue;
  const slugs = new Set(
    existsSync(resolve(root, r.contentDir))
      ? readdirSync(resolve(root, r.contentDir))
          .filter((f) => f.endsWith(r.ext))
          .map((f) => f.slice(0, -r.ext.length))
      : [],
  );
  for (const d of readdirSync(imgRoot, { withFileTypes: true })) {
    if (!d.isDirectory() || slugs.has(d.name)) continue;
    orphans++;
    console.log(`${doDelete ? "Xóa" : "Mồ côi"}: ${r.imageDir}/${d.name}`);
    if (doDelete) rmSync(resolve(imgRoot, d.name), { recursive: true, force: true });
  }
}
console.log(orphans ? `${orphans} thư mục${doDelete ? " đã xóa" : " (thêm --delete để xóa)"}.` : "Không có thư mục ảnh mồ côi.");
