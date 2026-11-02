// Kiểm tra nội dung trước khi đăng: bài, chủ đề, sách, ảnh. Chạy: npm run check-content
//   LỖI (thoát mã 1): thiếu trường bắt buộc, slug sai, chủ đề không tồn tại, file ảnh không có, bài liên quan trỏ nhầm...
//   CẢNH BÁO (vẫn thoát mã 0): sách chưa có bìa, nháp lệch trạng thái, mô tả hơi dài, thư mục ảnh mồ côi...
//   THÔNG TIN: bài đang lên lịch (ngày đăng ở tương lai).
// Tùy chọn: --root <thư mục> kiểm tra một thư mục khác (dùng cho test).
//   --base <nhánh / commit> so với bản đó: bài ĐÃ ĐĂNG ở bản gốc mà không còn ở đây (đổi slug hoặc xóa) mà chưa có chuyển hướng thì LỖI, vì link cũ sẽ hỏng.
//   Trên GitHub Actions (pull_request) tự dùng nhánh đích (biến GITHUB_BASE_REF), nên CI không cần đổi gì.
// LUẬT nằm ở src/shared/content-check.ts, nguồn ổ đĩa / git ở src/shared/content-check-node.ts (cả hai dùng chung với trang quản trị);
// file này chỉ là lớp vỏ: chọn thư mục / bản gốc, tính ảnh mồ côi, in kết quả. Node đọc thẳng file .ts (cần Node >= 22.18 / 23.6).
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let checkContent, fsSource, gitBase;
try {
  ({ checkContent } = await import("../src/shared/content-check.ts"));
  ({ fsSource, gitBase } = await import("../src/shared/content-check-node.ts"));
} catch (e) {
  console.error(`Không chạy được kiểm tra nội dung: ${String(e?.message ?? e).split(/\r?\n/)[0]}\nCần Node >= 22.18 để đọc file .ts (node --version).`);
  process.exit(1);
}

const argRoot = process.argv.indexOf("--root");
const root = argRoot > -1 ? resolve(process.argv[argRoot + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Bản gốc để so slug: --base, hoặc nhánh đích của pull request trên GitHub Actions
const infosBefore = [];
let base = null;
{
  const argBase = process.argv.indexOf("--base");
  const prBase = process.env.GITHUB_BASE_REF; // GitHub đặt khi chạy cho pull_request: tên nhánh đích (vd. "main")
  const baseRef = argBase > -1 ? process.argv[argBase + 1] : prBase ? `origin/${prBase}` : "";
  if (baseRef) {
    const r = gitBase(root, baseRef, { prBase, explicit: argBase > -1 });
    base = r.base;
    if (r.info) infosBefore.push(r.info);
  }
}

// Ảnh mồ côi: luật dọn ảnh DUY NHẤT ở src/cms/lib/content-cleanup.ts
let orphanImages = [];
try {
  const { findOrphanImages } = await import("../src/cms/lib/content-cleanup.ts");
  orphanImages = findOrphanImages(root);
} catch {
  infosBefore.push("Không kiểm tra được ảnh mồ côi (cần Node >= 22.18 để đọc file .ts).");
}

const r = checkContent(fsSource(root), { base, orphanImages });
const infos = [...infosBefore, ...r.infos];

// ---------- kết quả ----------
const out = (title, list) => list.length && console.log(`\n${title} (${list.length})\n${list.map((l) => `  - ${l}`).join("\n")}`);
console.log(`Đã kiểm tra: ${r.counts.posts} bài, ${r.counts.topics} chủ đề, ${r.counts.subtopics} chủ đề con, ${r.counts.books} sách.`);
out("LỖI", r.errors);
out("CẢNH BÁO", r.warnings);
out("THÔNG TIN", infos);
console.log(r.errors.length ? `\nKhông đạt: ${r.errors.length} lỗi.` : "\nĐạt: không có lỗi.");
process.exit(r.errors.length ? 1 : 0);
