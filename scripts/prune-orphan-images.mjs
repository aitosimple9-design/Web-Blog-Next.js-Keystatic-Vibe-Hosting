// Tìm (và xóa) ảnh MỒ CÔI: thư mục ảnh theo slug không còn bài / chủ đề / sách, file ảnh mà nội dung đã thôi nhắc tới
// (thay / gỡ ảnh), và file trong public/images/site mà Cài đặt không dùng nữa.
// Keystatic xóa file nội dung nhưng để lại ảnh. Chế độ local đã tự dọn qua route API; chế độ GitHub thì chạy script này.
// Chạy: npm run prune-images           (chỉ liệt kê)
//       npm run prune-images -- --delete  (xóa thật)
// Quy tắc nằm MỘT nơi duy nhất: src/lib/content-cleanup.ts (Node >= 22.18 đọc thẳng file .ts).
import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { findOrphanImages } = await import("../src/lib/content-cleanup.ts");
const doDelete = process.argv.includes("--delete");

const orphans = findOrphanImages(root);
for (const o of orphans) {
  console.log(`${doDelete ? "Xóa" : "Mồ côi"} (${o.kind === "folder" ? "thư mục" : "file"}): ${o.path}`);
  if (doDelete) rmSync(resolve(root, o.path), { recursive: true, force: true });
}
console.log(
  orphans.length ? `${orphans.length} mục${doDelete ? " đã xóa" : " (thêm --delete để xóa)"}.` : "Không có ảnh mồ côi.",
);
