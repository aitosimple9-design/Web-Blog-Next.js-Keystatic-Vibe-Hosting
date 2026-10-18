// Tạo sẵn chuyển hướng cho bài ĐÃ ĐĂNG ở nhánh gốc mà không còn ở nhánh này (đã xóa), để khỏi gõ tay từng cái khi dọn nhiều bài (vd. bài mẫu demo-*).
// Chạy: npm run make-redirects -- --base main [--to /blog] [--dry]
//   --base <ref>   nhánh / commit gốc để so (mặc định: main)
//   --to <đường dẫn>  nơi chuyển tới (mặc định: /blog); phải là trang có thật trên web
//   --dry          chỉ liệt kê, không ghi file
// Ghi vào content/redirects/bai-viet-<slug>.json (cùng định dạng Keystatic lưu). Bài đã có chuyển hướng thì bỏ qua. Chỉ bài ĐÃ ĐĂNG mới cần (nháp / lên lịch không cần).
// Slug đổi tên (không xóa) thì KHÔNG dùng script này: thêm tay ở Keystatic với đích là bài mới.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, def) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : def;
};
const base = arg("--base", "main");
const to = arg("--to", "/blog");
const dry = process.argv.includes("--dry");

const { readRedirectFiles, STATIC_ROUTES } = await import("../src/lib/redirects.ts");
if (!STATIC_ROUTES.includes(to) && !/^\/(?:bai-viet|blog)\/[a-z0-9-]+$/.test(to)) {
  console.error(`--to "${to}" không phải trang có thật (dùng /blog, /book, / hoặc /bai-viet/<slug>)`);
  process.exit(1);
}

const git = (...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
const str = (v) => (typeof v === "string" ? v.trim() : "");
const dateStr = (v) => (v instanceof Date && !Number.isNaN(v.getTime()) ? v.toISOString().slice(0, 10) : str(v));
const todayVN = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const live = (d) => d.draft !== true && d.status !== "draft" && d.status !== "review" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr(d.date)) && dateStr(d.date) <= todayVN;

const now = new Set(readdirSync(resolve(root, "content/posts")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)));
const have = new Set(readRedirectFiles(root).map((e) => e.from));
const names = git("ls-tree", "-r", "--name-only", base, "--", "content/posts").split(/\r?\n/).map((n) => n.trim()).filter((n) => n.endsWith(".md"));

const dir = resolve(root, "content/redirects");
let made = 0;
for (const n of names) {
  const slug = n.slice(n.lastIndexOf("/") + 1, -3);
  if (now.has(slug) || have.has(`/bai-viet/${slug}`)) continue;
  let data;
  try {
    ({ data } = matter(git("show", `${base}:${n}`)));
  } catch {
    continue;
  }
  if (!live(data)) continue;
  if (slug.startsWith("demo-")) continue; // bài mẫu: không cần chuyển hướng (cùng quy tắc với check-content)
  const entry = { label: `Bài đã xóa: ${slug}`, from: `/bai-viet/${slug}`, to, permanent: true };
  console.log(`${dry ? "[thử] " : ""}${entry.from} → ${to}`);
  if (!dry) {
    mkdirSync(dir, { recursive: true });
    const file = resolve(dir, `bai-viet-${slug}.json`);
    if (!existsSync(file)) writeFileSync(file, JSON.stringify(entry, null, 2));
  }
  made++;
}
console.log(made ? `${dry ? "Sẽ tạo" : "Đã tạo"} ${made} chuyển hướng.` : "Không có bài đã đăng nào bị mất: không cần tạo.");
