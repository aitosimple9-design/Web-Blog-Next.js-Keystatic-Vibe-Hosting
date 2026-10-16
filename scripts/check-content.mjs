// Kiểm tra nội dung trước khi đăng: bài, chủ đề, sách, ảnh. Chạy: npm run check-content
//   LỖI (thoát mã 1): thiếu trường bắt buộc, slug sai, chủ đề không tồn tại, file ảnh không có, bài liên quan trỏ nhầm...
//   CẢNH BÁO (vẫn thoát mã 0): sách chưa có bìa, nháp lệch trạng thái, mô tả hơi dài, thư mục ảnh mồ côi...
//   THÔNG TIN: bài đang lên lịch (ngày đăng ở tương lai).
// Tùy chọn: --root <thư mục> kiểm tra một thư mục khác (dùng cho test).
// Quy tắc phải khớp src/lib/posts.ts (đọc bài) và mục 5 của CLAUDE.md.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

// Chấm SEO dùng chung với trang quản trị (src/lib/seo-score.ts, hàm thuần). Node đọc thẳng file .ts (Node >= 22.18 / 23.6);
// bản Node cũ hơn không đọc được thì bỏ qua phần chấm SEO và báo rõ ở mục THÔNG TIN, không làm hỏng các kiểm tra khác.
let scoreSeo = null;
try {
  ({ scoreSeo } = await import("../src/lib/seo-score.ts"));
} catch {
  /* xử lý ở dưới */
}

const argRoot = process.argv.indexOf("--root");
const root =
  argRoot > -1 ? resolve(process.argv[argRoot + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), "..");

const errors = [];
const warnings = [];
const infos = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

const files = (dir, ext) => {
  const abs = resolve(root, dir);
  return existsSync(abs) ? readdirSync(abs).filter((f) => f.endsWith(ext)) : [];
};
const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(resolve(root, path), "utf8"));
  } catch {
    return null;
  }
};
const publicFile = (url) => existsSync(resolve(root, "public", url.replace(/^\/+/, "")));
const str = (v) => (typeof v === "string" ? v.trim() : "");
const dateStr = (v) => (v instanceof Date && !Number.isNaN(v.getTime()) ? v.toISOString().slice(0, 10) : str(v));
const todayVN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

// ---------- chủ đề ----------
const topicSlugs = new Set();
for (const f of files("content/topics", ".json")) {
  const slug = f.slice(0, -5);
  const where = `content/topics/${f}`;
  topicSlugs.add(slug);
  const t = readJson(where);
  if (!t) {
    err(where, "không đọc được (JSON hỏng)");
    continue;
  }
  if (!SLUG.test(slug)) err(where, "tên file phải là chữ thường không dấu nối bằng '-'");
  if (!str(t.name)) err(where, 'thiếu "name"');
  if (!str(t.description)) warn(where, "chưa có mô tả");
  if (!str(t.image)) warn(where, "chưa có ảnh nền (thẻ chủ đề dùng hình sinh tự động)");
  else if (!publicFile(t.image)) err(where, `file ảnh không tồn tại: ${t.image}`);
}
if (topicSlugs.size === 0) err("content/topics", "chưa có chủ đề nào");

// ---------- sách ----------
const bookNames = new Set();
for (const f of files("content/books", ".json")) {
  const where = `content/books/${f}`;
  const b = readJson(where);
  if (!b) {
    err(where, "không đọc được (JSON hỏng)");
    continue;
  }
  if (!str(b.name)) {
    err(where, 'thiếu "name"');
    continue;
  }
  if (bookNames.has(str(b.name))) err(where, `trùng tên sách "${str(b.name)}"`);
  bookNames.add(str(b.name));
  if (!str(b.cover)) warn(where, "chưa có bìa (dùng hình sinh tự động)");
  else if (!publicFile(b.cover)) err(where, `file bìa không tồn tại: ${b.cover}`);
}

// ---------- bài viết ----------
const postFiles = files("content/posts", ".md");
const posts = [];
const seoScores = [];
for (const f of postFiles) {
  const where = `content/posts/${f}`;
  let data, body;
  try {
    ({ data, content: body } = matter(readFileSync(resolve(root, where), "utf8")));
  } catch (e) {
    err(where, `frontmatter hỏng: ${e.message.split("\n")[0]}`);
    continue;
  }
  const slug = f.slice(0, -3);
  posts.push({ slug, data, where });

  if (!SLUG.test(slug)) err(where, "tên file phải là chữ thường không dấu nối bằng '-'");
  if (data.slug !== undefined && data.slug !== slug) err(where, `slug "${data.slug}" phải trùng tên file`);
  for (const k of ["title", "description", "category"]) if (!str(data[k])) err(where, `thiếu trường bắt buộc "${k}"`);
  if (!str(data.source?.book)) err(where, 'thiếu "source.book"');
  if (!str(data.source?.author)) err(where, 'thiếu "source.author"');

  const desc = str(data.description);
  if (desc.length > 160) err(where, `description dài ${desc.length} ký tự, tối đa 160`);
  else if (desc && desc.length < 50) warn(where, `description chỉ ${desc.length} ký tự, nên 50 đến 160 cho SEO`);
  if (str(data.seoTitle).length > 60) err(where, `seoTitle dài ${str(data.seoTitle).length} ký tự, tối đa 60`);

  const date = dateStr(data.date);
  if (!ISO.test(date)) err(where, `date phải có dạng YYYY-MM-DD (nhận được: ${String(data.date)})`);
  const updated = data.updated === undefined || data.updated === null || data.updated === "" ? "" : dateStr(data.updated);
  if (updated && !ISO.test(updated)) err(where, `updated phải có dạng YYYY-MM-DD (nhận được: ${String(data.updated)})`);
  else if (updated && date && updated < date) warn(where, `updated (${updated}) sớm hơn ngày đăng (${date})`);

  if (str(data.category) && !topicSlugs.has(str(data.category))) {
    err(where, `chủ đề "${data.category}" không có trong content/topics (hiện có: ${[...topicSlugs].join(", ")})`);
  }
  if (str(data.source?.book) && !bookNames.has(str(data.source.book))) {
    warn(where, `sách "${data.source.book}" chưa có trong mục Sách, bìa sẽ là hình sinh tự động`);
  }

  for (const k of ["cover", "ogImage"]) {
    const v = str(data[k]);
    if (v && !publicFile(v)) err(where, `file ảnh ${k} không tồn tại: ${v}`);
  }
  if (!str(data.cover)) warn(where, "chưa có ảnh bìa (hero dùng hình sinh tự động)");

  // ảnh chèn trong thân bài
  for (const m of body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    const src = m[1];
    if (src.startsWith("/") && !publicFile(src)) err(where, `ảnh trong nội dung không tồn tại: ${src}`);
    // Keystatic lưu ảnh của bài vào CÙNG thư mục theo tên file: hai ảnh cùng tên (vd. cùng là cover.jpg) ghi đè lên nhau, bài hiện hai lần cùng một ảnh
    if (src === str(data.cover) || src === str(data.ogImage)) {
      warn(where, `ảnh trong nội dung dùng chung file với ảnh bìa / ảnh chia sẻ (${src}): hai ảnh cùng tên bị ghi đè lên nhau. Đổi "File name" của ảnh trong bài (bấm vào ảnh, nút sửa)`);
    }
  }

  // điểm SEO (chỉ cảnh báo, không bao giờ làm CI đỏ)
  if (scoreSeo) {
    const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
    const r = scoreSeo({
      title: str(data.title),
      seoTitle: str(data.seoTitle),
      description: str(data.description),
      slug,
      focusKeyword: str(data.focusKeyword),
      cover: str(data.cover),
      coverAlt: str(data.coverAlt),
      ogImage: str(data.ogImage),
      tags: list(data.tags),
      related: list(data.related),
      body,
    });
    seoScores.push(r.score);
    const bad = r.checks.filter((c) => c.status === "bad").map((c) => `${c.label} (${c.detail})`);
    if (bad.length > 0) warn(where, `SEO ${r.score}/100, chưa đạt: ${bad.join("; ")}`);
  }

  // trạng thái
  const status = str(data.status);
  if (status && !["draft", "review", "published"].includes(status)) err(where, `status "${status}" không hợp lệ`);
  if (data.draft === true && status === "published") warn(where, 'tick "Ẩn bài này" (draft) nhưng Trạng thái là "Đã đăng": bài vẫn bị ẩn');
  if (data.draft !== true && (status === "draft" || status === "review")) {
    infos.push(`${where}: Trạng thái "${status}" nên bài đang bị ẩn`);
  }
  if (ISO.test(date) && date > todayVN && data.draft !== true && status !== "draft" && status !== "review") {
    infos.push(`${where}: LÊN LỊCH ngày ${date} (hiện sau lần deploy vào hoặc sau ngày đó)`);
  }
}

if (!scoreSeo) infos.push("Bỏ qua chấm điểm SEO: Node này không đọc được file .ts (cần Node >= 22.18)");
else if (seoScores.length > 0) {
  const avg = Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length);
  infos.push(`Điểm SEO trung bình ${avg}/100 (${seoScores.length} bài); chi tiết từng bài ở trang quản trị`);
}

const slugs = new Set(posts.map((p) => p.slug));
const titleSeen = new Map();
for (const p of posts) {
  const title = str(p.data.title).toLowerCase();
  if (title) {
    if (titleSeen.has(title)) warn(p.where, `trùng tiêu đề với ${titleSeen.get(title)}`);
    else titleSeen.set(title, p.where);
  }
  if (Array.isArray(p.data.related)) {
    for (const r of p.data.related) {
      if (r === p.slug) err(p.where, "bài liên quan trỏ về chính nó");
      else if (!slugs.has(r)) err(p.where, `bài liên quan "${r}" không tồn tại`);
    }
  }
}

// ---------- ảnh mồ côi (quy tắc dùng chung ở src/lib/content-cleanup.ts) ----------
try {
  const { findOrphanImages } = await import("../src/lib/content-cleanup.ts");
  for (const o of findOrphanImages(root)) {
    warn(o.path, `${o.kind === "folder" ? "thư mục ảnh" : "file ảnh"} mồ côi, không còn thuộc nội dung nào (chạy npm run prune-images)`);
  }
} catch {
  infos.push("Không kiểm tra được ảnh mồ côi (cần Node >= 22.18 để đọc file .ts).");
}

// ---------- kết quả ----------
const out = (title, list) => list.length && console.log(`\n${title} (${list.length})\n${list.map((l) => `  - ${l}`).join("\n")}`);
console.log(`Đã kiểm tra: ${posts.length} bài, ${topicSlugs.size} chủ đề, ${bookNames.size} sách.`);
out("LỖI", errors);
out("CẢNH BÁO", warnings);
out("THÔNG TIN", infos);
console.log(errors.length ? `\nKhông đạt: ${errors.length} lỗi.` : "\nĐạt: không có lỗi.");
process.exit(errors.length ? 1 : 0);
