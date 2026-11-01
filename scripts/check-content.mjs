// Kiểm tra nội dung trước khi đăng: bài, chủ đề, sách, ảnh. Chạy: npm run check-content
//   LỖI (thoát mã 1): thiếu trường bắt buộc, slug sai, chủ đề không tồn tại, file ảnh không có, bài liên quan trỏ nhầm...
//   CẢNH BÁO (vẫn thoát mã 0): sách chưa có bìa, nháp lệch trạng thái, mô tả hơi dài, thư mục ảnh mồ côi...
//   THÔNG TIN: bài đang lên lịch (ngày đăng ở tương lai).
// Tùy chọn: --root <thư mục> kiểm tra một thư mục khác (dùng cho test).
//   --base <nhánh / commit> so với bản đó: bài ĐÃ ĐĂNG ở bản gốc mà không còn ở đây (đổi slug hoặc xóa) mà chưa có chuyển hướng thì LỖI, vì link cũ sẽ hỏng.
//   Trên GitHub Actions (pull_request) tự dùng nhánh đích (biến GITHUB_BASE_REF), nên CI không cần đổi gì.
// LUẬT nằm ở src/shared/content-check.ts (dùng chung với trang quản trị); file này chỉ là lớp vỏ: đọc ổ đĩa, lấy bản gốc bằng git, in kết quả.
// Node đọc thẳng file .ts (cần Node >= 22.18 / 23.6).
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let checkContent;
try {
  ({ checkContent } = await import("../src/shared/content-check.ts"));
} catch (e) {
  console.error(`Không chạy được kiểm tra nội dung: ${String(e?.message ?? e).split(/\r?\n/)[0]}\nCần Node >= 22.18 để đọc file .ts (node --version).`);
  process.exit(1);
}

const argRoot = process.argv.indexOf("--root");
const root = argRoot > -1 ? resolve(process.argv[argRoot + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Nguồn = ổ đĩa ở thư mục gốc
const source = {
  list: (dir, ext) => {
    const abs = resolve(root, dir);
    return existsSync(abs) ? readdirSync(abs).filter((f) => f.endsWith(ext)) : [];
  },
  read: (rel) => {
    try {
      return readFileSync(resolve(root, rel), "utf8");
    } catch {
      return null;
    }
  },
  exists: (rel) => existsSync(resolve(root, rel)),
};

// Bản gốc để so slug: --base, hoặc nhánh đích của pull request trên GitHub Actions
const infosBefore = [];
let base = null;
{
  const argBase = process.argv.indexOf("--base");
  const prBase = process.env.GITHUB_BASE_REF; // GitHub đặt khi chạy cho pull_request: tên nhánh đích (vd. "main")
  const baseRef = argBase > -1 ? process.argv[argBase + 1] : prBase ? `origin/${prBase}` : "";
  if (baseRef) {
    const git = (...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
    try {
      if (argBase === -1 && prBase) {
        try {
          git("fetch", "--quiet", "--depth=1", "origin", prBase); // checkout của CI chỉ lấy 1 commit nên phải lấy thêm nhánh đích
        } catch {
          /* thử dùng ref sẵn có */
        }
      }
      let ref = baseRef;
      try {
        git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
      } catch {
        if (argBase === -1) ref = "FETCH_HEAD";
      }
      git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`); // không có lịch sử của bản gốc thì báo ở dưới
      base = {
        label: baseRef,
        list: (dir, ext) =>
          git("ls-tree", "--name-only", `${ref}:${dir}`)
            .split(/\r?\n/)
            .map((n) => n.trim())
            .filter((n) => n.endsWith(ext)),
        read: (rel) => {
          try {
            return git("show", `${ref}:${rel}`);
          } catch {
            return null;
          }
        },
      };
      // thư mục không có ở bản gốc: ls-tree báo lỗi → coi như rỗng
      const list = base.list;
      base.list = (dir, ext) => {
        try {
          return list(dir, ext);
        } catch {
          return [];
        }
      };
    } catch {
      infosBefore.push(`Không so được slug với ${baseRef} (chưa có lịch sử git của nhánh đó); bỏ qua.`);
    }
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

const r = checkContent(source, { base, orphanImages });
const infos = [...infosBefore, ...r.infos];

// ---------- kết quả ----------
const out = (title, list) => list.length && console.log(`\n${title} (${list.length})\n${list.map((l) => `  - ${l}`).join("\n")}`);
console.log(`Đã kiểm tra: ${r.counts.posts} bài, ${r.counts.topics} chủ đề, ${r.counts.subtopics} chủ đề con, ${r.counts.books} sách.`);
out("LỖI", r.errors);
out("CẢNH BÁO", r.warnings);
out("THÔNG TIN", infos);
console.log(r.errors.length ? `\nKhông đạt: ${r.errors.length} lỗi.` : "\nĐạt: không có lỗi.");
process.exit(r.errors.length ? 1 : 0);
