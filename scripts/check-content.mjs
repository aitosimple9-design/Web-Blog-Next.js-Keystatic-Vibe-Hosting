// Kiểm tra nội dung trước khi đăng: bài, chủ đề, sách, ảnh. Chạy: npm run check-content
//   LỖI (thoát mã 1): thiếu trường bắt buộc, slug sai, chủ đề không tồn tại, file ảnh không có, bài liên quan trỏ nhầm...
//   CẢNH BÁO (vẫn thoát mã 0): sách chưa có bìa, nháp lệch trạng thái, mô tả hơi dài, thư mục ảnh mồ côi...
//   THÔNG TIN: bài đang lên lịch (ngày đăng ở tương lai).
// Tùy chọn: --root <thư mục> kiểm tra một thư mục khác (dùng cho test).
//   --base <nhánh / commit> so với bản đó: bài ĐÃ ĐĂNG ở bản gốc mà không còn ở đây (đổi slug hoặc xóa) mà chưa có chuyển hướng thì LỖI, vì link cũ sẽ hỏng.
//   Trên GitHub Actions (pull_request) tự dùng nhánh đích (biến GITHUB_BASE_REF), nên CI không cần đổi gì.
// Quy tắc phải khớp src/lib/posts.ts (đọc bài) và mục 5 của CLAUDE.md.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

// Chấm SEO dùng chung với trang quản trị (src/lib/seo-score.ts, hàm thuần). Node đọc thẳng file .ts (Node >= 22.18 / 23.6);
// bản Node cũ hơn không đọc được thì bỏ qua phần chấm SEO và báo rõ ở mục THÔNG TIN, không làm hỏng các kiểm tra khác.
let scoreSeo = null;
try {
  ({ scoreSeo } = await import("../src/shared/seo-score.ts"));
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
const IMAGE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpe?g|png|webp|gif|svg|avif)$/;

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

// ---------- chủ đề con (cấp dưới chủ đề; slug duy nhất toàn site, URL /blog/<chủ đề>/<slug>) ----------
const subtopicTopic = new Map(); // slug chủ đề con -> slug chủ đề lớn
for (const f of files("content/subtopics", ".json")) {
  const slug = f.slice(0, -5);
  const where = `content/subtopics/${f}`;
  const s = readJson(where);
  if (!s) {
    err(where, "không đọc được (JSON hỏng)");
    continue;
  }
  subtopicTopic.set(slug, str(s.topic));
  if (!SLUG.test(slug)) err(where, "tên file phải là chữ thường không dấu nối bằng '-'");
  if (slug === "trang") err(where, 'slug "trang" dành cho phân trang (/blog/<chủ đề>/trang/<n>), hãy đặt tên khác');
  if (!str(s.name)) err(where, 'thiếu "name"');
  if (!str(s.topic)) err(where, 'thiếu "topic" (chủ đề lớn)');
  else if (!topicSlugs.has(str(s.topic))) err(where, `chủ đề "${s.topic}" không có trong content/topics (hiện có: ${[...topicSlugs].join(", ")})`);
  if (!str(s.description)) warn(where, "chưa có mô tả");
  if (str(s.image) && !publicFile(s.image)) err(where, `file ảnh không tồn tại: ${s.image}`);
  if (topicSlugs.has(slug)) warn(where, `slug trùng với một chủ đề (${slug}), dễ nhầm khi chọn trong Keystatic`);
}

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
  posts.push({ slug, data, where, body });

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
  {
    const subs = Array.isArray(data.subtopics) ? data.subtopics.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim()) : [];
    if (subs.length === 0) err(where, 'thiếu "subtopics": bài phải thuộc ít nhất một chủ đề con (Keystatic: ô "Chủ đề con")');
    for (const sub of new Set(subs)) {
      if (!subtopicTopic.has(sub)) err(where, `chủ đề con "${sub}" không có trong content/subtopics (hiện có: ${[...subtopicTopic.keys()].join(", ") || "chưa có"})`);
      else if (str(data.category) && subtopicTopic.get(sub) !== str(data.category)) {
        err(where, `chủ đề con "${sub}" thuộc chủ đề "${subtopicTopic.get(sub)}", không thuộc chủ đề "${data.category}" của bài`);
      }
    }
  }
  if (str(data.source?.book) && !bookNames.has(str(data.source.book))) {
    warn(where, `sách "${data.source.book}" chưa có trong mục Sách, bìa sẽ là hình sinh tự động`);
  }

  for (const k of ["cover", "ogImage"]) {
    const v = str(data[k]);
    if (v && !publicFile(v)) err(where, `file ảnh ${k} không tồn tại: ${v}`);
    else if (v && !IMAGE_NAME.test(v.slice(v.lastIndexOf("/") + 1))) warn(where, `tên file ảnh ${k} nên là chữ thường không dấu nối bằng '-' (không dấu cách): ${v}`);
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

// Bài đang hiển thị công khai: không ẩn (draft / status), và ngày đăng không ở tương lai (giờ VN). Khớp src/lib/posts.ts
const live = (d) => d.draft !== true && d.status !== "draft" && d.status !== "review" && ISO.test(dateStr(d.date)) && dateStr(d.date) <= todayVN;

// ---------- chuyển hướng (content/redirects/*.json, quy tắc ở src/lib/redirects.ts) ----------
// Lỗi gõ sai, vòng lặp, đích không tồn tại, che mất trang đang chạy đều là LỖI. Lúc chạy web, buildRedirects() vẫn tự bỏ mục hỏng nên web không sập.
const redirectFroms = new Set(); // đường dẫn cũ hợp lệ, dùng ở phần "slug ổn định" bên dưới
try {
  const { readRedirectFiles, entryProblem, finalTarget, REDIRECTS_MAX, RESERVED_PREFIXES, STATIC_ROUTES } = await import("../src/shared/redirects.ts");
  const entries = readRedirectFiles(root);
  if (entries.length > REDIRECTS_MAX) err("content/redirects", `có ${entries.length} chuyển hướng, vượt giới hạn ${REDIRECTS_MAX} của Next.js`);
  const livePaths = new Set([...STATIC_ROUTES, ...[...topicSlugs].map((t) => `/blog/${t}`), ...[...subtopicTopic].map(([sl, t]) => `/blog/${t}/${sl}`), ...posts.filter((p) => live(p.data)).map((p) => `/bai-viet/${p.slug}`)]);
  const exists = (p) => livePaths.has(p) || [...topicSlugs].some((t) => new RegExp(`^/blog/${t}/trang/[0-9]+$`).test(p)) || [...subtopicTopic].some(([sl, t]) => new RegExp(`^/blog/${t}/${sl}/trang/[0-9]+$`).test(p));
  const bySource = new Map();
  const toCheck = [];
  for (const e of entries) {
    const where = `content/redirects/${e.file}`;
    const problem = entryProblem(e);
    if (problem) {
      err(where, problem);
      continue;
    }
    if (bySource.has(e.from)) {
      err(where, `đường dẫn cũ "${e.from}" bị khai báo hai lần (cũng ở content/redirects/${bySource.get(e.from).file})`);
      continue;
    }
    bySource.set(e.from, e);
    if (exists(e.from)) err(where, `"${e.from}" đang là trang có thật trên web: chuyển hướng sẽ che mất nó (xóa chuyển hướng này, hoặc đổi / ẩn trang đó trước)`);
    if (e.to.startsWith("/")) toCheck.push({ where, e });
  }
  // Đích phải là trang có thật, hoặc là đường dẫn cũ của một chuyển hướng khác (chuỗi nối tiếp: chỉ cảnh báo ở dưới)
  for (const { where, e } of toCheck) {
    if (!exists(e.to) && !bySource.has(e.to)) err(where, `đường dẫn mới "${e.to}" không phải trang có trên web (kiểm tra chính tả; bài nháp hoặc lên lịch chưa công khai cũng không dùng được)`);
  }
  const map = new Map([...bySource].map(([k, e]) => [k, e.to]));
  for (const [from, e] of bySource) {
    const end = finalTarget(from, map);
    if (end === null) err(`content/redirects/${e.file}`, `vòng lặp chuyển hướng bắt đầu từ "${from}"`);
    else if (end !== e.to) warn(`content/redirects/${e.file}`, `chuỗi nối tiếp "${from}" → "${e.to}" → ... → "${end}": hãy trỏ thẳng tới "${end}" (web vẫn chạy đúng nhưng mỗi bước thêm một lần chuyển, hại SEO; web đã tự gộp về đích cuối nên không hỏng)`);
    redirectFroms.add(from);
  }
  if (entries.length) infos.push(`Chuyển hướng: ${entries.length} mục.`);

  // Link nội bộ trong thân bài (/bai-viet/..., /blog/...) phải trỏ tới trang có thật. Đổi slug bài kia mà bài này còn link cũ thì link gãy (404).
  // Bài đã đăng: LỖI; bài nháp / lên lịch: chỉ CẢNH BÁO. Link đi qua chuyển hướng vẫn chạy nhưng nên sửa thành link thẳng. Link tới file (có đuôi .pdf, .jpg...) bỏ qua.
  const LINK = /\]\(\s*(\/[^)\s]*)|href=["'](\/[^"']*)/g;
  const postSlugs = new Set(posts.map((p) => p.slug));
  let linkCount = 0;
  for (const p of posts) {
    const isLive = live(p.data);
    const seen = new Set();
    for (const m of (p.body ?? "").matchAll(LINK)) {
      let path = (m[1] ?? m[2]).split(/[?#]/)[0].replace(/\/+$/, "") || "/";
      if (seen.has(path) || /\.[a-z0-9]{2,5}$/i.test(path) || path.startsWith("//")) continue;
      seen.add(path);
      if (RESERVED_PREFIXES.some((r) => path === r || path.startsWith(`${r}/`))) continue;
      linkCount++;
      if (exists(path)) continue;
      const bad = bySource.has(path)
        ? null
        : /^\/bai-viet\/[^/]+$/.test(path) && postSlugs.has(path.slice(10))
          ? `link nội bộ "${path}" trỏ tới bài chưa đăng (nháp hoặc lên lịch), người đọc sẽ gặp 404`
          : `link nội bộ "${path}" không trỏ tới trang nào có trên web (bài đổi slug / bị xóa? sửa link, hoặc thêm chuyển hướng)`;
      if (bad) (isLive ? err : warn)(p.where, bad);
      else warn(p.where, `link nội bộ "${path}" đang đi qua chuyển hướng tới "${finalTarget(path, map)}": nên sửa thành link thẳng`);
    }
  }
  if (linkCount) infos.push(`Đã kiểm tra ${linkCount} link nội bộ trong thân bài.`);
} catch (e) {
  infos.push(`Không kiểm tra được chuyển hướng (${String(e.message).split(/\r?\n/)[0]}); cần Node >= 22.18 để đọc file .ts.`);
}

// ---------- slug của bài đã đăng phải ổn định (so với nhánh gốc) ----------
// Bài đã đăng mà đổi tên file (slug) hoặc bị xóa thì link cũ trả 404 và mất thứ hạng tìm kiếm. Chỉ CẢNH BÁO: xóa có chủ ý (vd. dọn bài mẫu) là hợp lệ.
{
  const argBase = process.argv.indexOf("--base");
  const prBase = process.env.GITHUB_BASE_REF; // GitHub đặt khi chạy cho pull_request: tên nhánh đích (vd. "main")
  const baseRef = argBase > -1 ? process.argv[argBase + 1] : prBase ? `origin/${prBase}` : "";
  if (baseRef) {
    const git = (...a) =>
      execFileSync("git", ["-C", root, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
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
      const names = git("ls-tree", "-r", "--name-only", ref, "--", "content/posts").split(/\r?\n/).map((n) => n.trim()).filter((n) => n.endsWith(".md"));
      const baseSlugs = new Set(names.map((n) => n.slice(n.lastIndexOf("/") + 1, -3)));
      const nowTitles = new Map(posts.filter((p) => !baseSlugs.has(p.slug)).map((p) => [str(p.data.title).toLowerCase(), p.slug]));
      let checked = 0;
      let lost = 0;
      let handled = 0;
      for (const n of names) {
        const slug = n.slice(n.lastIndexOf("/") + 1, -3);
        let data;
        try {
          ({ data } = matter(git("show", `${ref}:${n}`)));
        } catch {
          continue;
        }
        if (!live(data)) continue;
        if (slug.startsWith("demo-")) continue; // bài mẫu (demo-*): được sửa thành bài thật / đổi slug thoải mái, chưa có người đọc
        checked++;
        if (slugs.has(slug)) continue;
        if (redirectFroms.has(`/bai-viet/${slug}`)) {
          handled++; // đã có chuyển hướng từ link cũ: không mất link
          continue;
        }
        lost++;
        const renamed = nowTitles.get(str(data.title).toLowerCase());
        err(
          n,
          renamed
            ? `bài đã đăng nhưng slug đổi thành "${renamed}": link cũ /bai-viet/${slug} sẽ trả 404. Thêm chuyển hướng /bai-viet/${slug} → /bai-viet/${renamed} (menu Chuyển hướng) hoặc trả lại slug cũ`
            : `bài đã đăng ở ${baseRef} nhưng không còn ở nhánh này: link cũ /bai-viet/${slug} sẽ trả 404. Thêm chuyển hướng (menu Chuyển hướng; xóa hàng loạt: npm run make-redirects) hoặc khôi phục bài`,
        );
      }
      // Chủ đề (/blog/<slug>): đổi slug hoặc xóa mà chưa có chuyển hướng thì link cũ 404
      let topicsLost = 0;
      for (const n of git("ls-tree", "-r", "--name-only", ref, "--", "content/topics").split(/\r?\n/).map((x) => x.trim()).filter((x) => x.endsWith(".json"))) {
        const tslug = n.slice(n.lastIndexOf("/") + 1, -5);
        if (topicSlugs.has(tslug) || redirectFroms.has(`/blog/${tslug}`)) continue;
        topicsLost++;
        err(n, `chủ đề ở ${baseRef} không còn (đổi slug hoặc bị xóa): link cũ /blog/${tslug} sẽ trả 404. Thêm chuyển hướng /blog/${tslug} → slug mới hoặc /blog (menu Chuyển hướng, Loại "Chủ đề")`);
      }
      // Chủ đề con (/blog/<chủ đề>/<chủ đề con>): mất, đổi slug hoặc đổi chủ đề cha mà chưa có chuyển hướng thì link cũ 404
      let subsLost = 0;
      for (const n of git("ls-tree", "-r", "--name-only", ref, "--", "content/subtopics").split(/\r?\n/).map((x) => x.trim()).filter((x) => x.endsWith(".json"))) {
        const sslug = n.slice(n.lastIndexOf("/") + 1, -5);
        let oldTopic = "";
        try {
          oldTopic = String(JSON.parse(git("show", `${ref}:${n}`)).topic ?? "").trim();
        } catch {
          continue;
        }
        if (!oldTopic || subtopicTopic.get(sslug) === oldTopic || redirectFroms.has(`/blog/${oldTopic}/${sslug}`)) continue;
        subsLost++;
        err(n, `chủ đề con ở ${baseRef} không còn ở địa chỉ cũ (đổi slug, đổi chủ đề cha hoặc bị xóa): link cũ /blog/${oldTopic}/${sslug} sẽ trả 404. Thêm chuyển hướng /blog/${oldTopic}/${sslug} → địa chỉ mới hoặc /blog/${oldTopic} (menu Chuyển hướng, Loại "Khác")`);
      }
      infos.push(subsLost ? `Chủ đề con: ${subsLost} chủ đề con mất hoặc đổi địa chỉ mà chưa có chuyển hướng (xem LỖI).` : "Chủ đề con: địa chỉ ổn định.");
      infos.push(topicsLost ? `Chủ đề: ${topicsLost} chủ đề mất hoặc đổi slug mà chưa có chuyển hướng (xem LỖI).` : "Chủ đề: slug ổn định.");
      infos.push(lost ? `Đã so ${checked} bài đã đăng với ${baseRef}: ${lost} bài mất hoặc đổi slug mà chưa có chuyển hướng (xem LỖI).` : `Đã so ${checked} bài đã đăng với ${baseRef}: slug ổn định${handled ? ` (${handled} bài đã có chuyển hướng)` : ""}.`);
    } catch {
      infos.push(`Không so được slug với ${baseRef} (chưa có lịch sử git của nhánh đó); bỏ qua.`);
    }
  }
}

// ---------- Trang chủ (content/pages/trang-chu.json): ảnh còn file, tủ sách trỏ tới sách / chủ đề còn tồn tại ----------
{
  const where = "content/pages/trang-chu.json";
  const home = readJson(where);
  if (existsSync(resolve(root, where)) && !home) err(where, "không đọc được (JSON hỏng)");
  if (home) {
    for (const k of ["portrait", "storyImage"]) {
      if (str(home[k]) && !publicFile(home[k])) err(where, `file ảnh không tồn tại (${k}): ${home[k]}`);
    }
    const bookSlugs = new Set(files("content/books", ".json").map((f) => f.slice(0, -5)));
    for (const [i, b] of (Array.isArray(home.shelf?.books) ? home.shelf.books : []).entries()) {
      if (!b?.book) err(where, `tủ sách mục ${i + 1}: chưa chọn sách`);
      else if (!bookSlugs.has(b.book)) err(where, `tủ sách mục ${i + 1}: sách "${b.book}" không còn trong mục Sách`);
      if (b?.topic && !topicSlugs.has(b.topic)) warn(where, `tủ sách mục ${i + 1}: chủ đề "${b.topic}" không còn, bìa sẽ không bấm được`);
    }
    for (const k of ["name", "positioning"]) {
      if (/\[mẫu\]/.test(str(home[k]))) warn(where, `"${k}" vẫn là chữ [mẫu]`);
    }
    const sample = JSON.stringify(home).match(/\[mẫu\]/g)?.length ?? 0;
    if (sample) infos.push(`${where}: còn ${sample} chỗ chữ [mẫu] cần thay bằng nội dung thật trước khi chạy quảng cáo`);
  }
}

// ---------- trang chữ: Chính sách riêng tư, Liên hệ (content/pages/<tên>.md; quy tắc ở src/lib/legal-pages.ts) ----------
// Trang TRỐNG thì ẨN (404, không vào sitemap, không có liên kết) nên chỉ báo THÔNG TIN; còn chữ [mẫu] hoặc email sai thì báo trước khi chạy quảng cáo.
for (const [file, label, isContact] of [["chinh-sach-rieng-tu", "Chính sách riêng tư", false], ["lien-he", "Liên hệ", true]]) {
  const where = `content/pages/${file}.md`;
  if (!existsSync(resolve(root, where))) {
    infos.push(`${label}: chưa có trang (đang ẨN: không có trên web, không vào sitemap, chân trang chưa có liên kết).`);
    continue;
  }
  let parsed;
  try {
    parsed = matter(readFileSync(resolve(root, where), "utf8"));
  } catch (e) {
    err(where, `frontmatter hỏng: ${e.message.split(/\r?\n/)[0]}`);
    continue;
  }
  const body = parsed.content.trim();
  const email = isContact ? str(parsed.data.email) : "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err(where, `email "${email}" sai định dạng`);
  const shown = body || (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  if (!shown) infos.push(`${label}: đang ẨN (chưa có nội dung).`);
  if (/\[mẫu\]/.test(`${body} ${JSON.stringify(parsed.data)}`)) warn(where, "còn chữ [mẫu], cần thay bằng nội dung thật (và được duyệt) trước khi chạy quảng cáo");
}

// ---------- ảnh mồ côi (quy tắc dùng chung ở src/lib/content-cleanup.ts) ----------
try {
  const { findOrphanImages } = await import("../src/cms/lib/content-cleanup.ts");
  for (const o of findOrphanImages(root)) {
    warn(o.path, `${o.kind === "folder" ? "thư mục ảnh" : "file ảnh"} mồ côi, không còn thuộc nội dung nào (chạy npm run prune-images)`);
  }
} catch {
  infos.push("Không kiểm tra được ảnh mồ côi (cần Node >= 22.18 để đọc file .ts).");
}

// ---------- địa chỉ web (NEXT_PUBLIC_SITE_URL) ----------
// Production thật mà để trống / localhost / sai dạng = LỖI; địa chỉ vercel.app = CẢNH BÁO; môi trường khác chỉ báo THÔNG TIN.
try {
  const { checkSiteUrl } = await import("../src/shared/site-url-check.ts");
  const s = checkSiteUrl();
  if (s.level === "error") err("NEXT_PUBLIC_SITE_URL", s.message);
  else if (s.level === "warn") warn("NEXT_PUBLIC_SITE_URL", s.message);
  else infos.push(`NEXT_PUBLIC_SITE_URL: ${s.message}`);
} catch {
  infos.push("Không kiểm tra được NEXT_PUBLIC_SITE_URL (cần Node >= 22.18 để đọc file .ts).");
}

// ---------- kết quả ----------
const out = (title, list) => list.length && console.log(`\n${title} (${list.length})\n${list.map((l) => `  - ${l}`).join("\n")}`);
console.log(`Đã kiểm tra: ${posts.length} bài, ${topicSlugs.size} chủ đề, ${subtopicTopic.size} chủ đề con, ${bookNames.size} sách.`);
out("LỖI", errors);
out("CẢNH BÁO", warnings);
out("THÔNG TIN", infos);
console.log(errors.length ? `\nKhông đạt: ${errors.length} lỗi.` : "\nĐạt: không có lỗi.");
process.exit(errors.length ? 1 : 0);
