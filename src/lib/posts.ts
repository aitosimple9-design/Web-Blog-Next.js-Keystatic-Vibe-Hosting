// MODULE DUY NHẤT đọc bài viết (CLAUDE.md mục 3). Mọi trang lấy bài qua file này.
// Nguồn: content/posts/<slug>.md (Markdown + frontmatter YAML, cấu trúc ở CLAUDE.md mục 5).
// Muốn đổi CMS (Keystatic, WordPress Headless…) chỉ cần viết lại file này.

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { rehypeImageSize } from "@/lib/rehype-image-size";
import type { Root, Element, Nodes } from "hast";
import { topicBySlug, getTopics } from "@/lib/topics";
import { readingMinutes } from "@/lib/format";
import { scoreSeo, type SeoInput, type SeoResult } from "@/lib/seo-score";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type Heading = { id: string; text: string };

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  /** Ngày sửa gần nhất (YYYY-MM-DD, tùy chọn); dùng cho dateModified ở JSON-LD */
  updated?: string;
  source: { book: string; author: string };
  cover?: string;
  /** Mô tả ảnh bìa (alt); thiếu thì ảnh bìa được coi là trang trí */
  coverAlt?: string;
  /** Bài bị ẩn: tick "Ẩn bài này" (`draft: true`), hoặc Trạng thái là Nháp / Chờ duyệt */
  draft: boolean;
  tags: string[];
  /** Từ khóa chính, chỉ để chấm điểm SEO ở trang quản trị; không bao giờ ra HTML hay metadata */
  focusKeyword?: string;
  /** Tiêu đề SEO riêng (thẻ title); thiếu thì dùng `title` */
  seoTitle?: string;
  /** Ảnh chia sẻ riêng (Open Graph) */
  ogImage?: string;
  /** Slug các bài liên quan chọn tay */
  related: string[];
  readingMinutes: number;
};
// Trường `notes` (ghi chú nội bộ) cố ý KHÔNG đọc: không bao giờ ra HTML, metadata hay JSON-LD.

export type Post = PostMeta & { html: string; headings: Heading[] };

// ---------- kiểm tra dữ liệu: thiếu / sai trường thì build báo lỗi rõ ràng ----------

function fail(file: string, msg: string): never {
  throw new Error(`[content/posts/${file}] ${msg}`);
}

function str(file: string, data: Record<string, unknown>, key: string): string {
  const v = data[key];
  if (typeof v !== "string" || v.trim() === "") {
    fail(file, `thiếu hoặc rỗng trường bắt buộc "${key}"`);
  }
  return v.trim();
}

function toIsoDate(file: string, v: unknown): string {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return fail(file, `trường "date" phải có dạng YYYY-MM-DD (nhận được: ${String(v)})`);
}

function parseMeta(file: string, data: Record<string, unknown>, body: string): PostMeta {
  // Keystatic lấy slug từ tên file và không ghi `slug:` vào frontmatter → thiếu thì dùng tên file;
  // có thì phải trùng tên file (bài viết tay / dự án B vẫn khai báo `slug:`).
  const slug = data.slug === undefined ? file.replace(/\.md$/, "") : str(file, data, "slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(file, `slug "${slug}" phải là chữ thường, không dấu, nối bằng "-"`);
  }
  if (`${slug}.md` !== file) {
    fail(file, `slug "${slug}" phải trùng tên file (${slug}.md)`);
  }
  const description = str(file, data, "description");
  if (description.length > 160) {
    fail(file, `description dài ${description.length} ký tự, tối đa 160`);
  }
  const category = str(file, data, "category");
  if (!topicBySlug(category)) {
    fail(
      file,
      `category "${category}" chưa có trong content/topics (hiện có: ${getTopics()
        .map((t) => t.slug)
        .join(", ")})`,
    );
  }
  const source = data.source as Record<string, unknown> | undefined;
  if (!source || typeof source !== "object") {
    fail(file, 'thiếu khối bắt buộc "source" (book, author)');
  }
  const opt = (k: string) => (typeof data[k] === "string" && (data[k] as string).trim() ? (data[k] as string).trim() : undefined);
  const cover = opt("cover");
  const list = (k: string) =>
    Array.isArray(data[k]) ? (data[k] as unknown[]).filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
  const updated = data.updated === undefined || data.updated === null || data.updated === "" ? undefined : toIsoDate(file, data.updated);
  const hiddenByStatus = data.status === "draft" || data.status === "review";

  return {
    slug,
    title: str(file, data, "title"),
    description,
    category,
    date: toIsoDate(file, data.date),
    updated,
    source: { book: str(file, source, "book"), author: str(file, source, "author") },
    cover,
    coverAlt: opt("coverAlt"),
    draft: data.draft === true || hiddenByStatus,
    tags: list("tags"),
    focusKeyword: opt("focusKeyword"),
    seoTitle: opt("seoTitle"),
    ogImage: opt("ogImage"),
    related: list("related"),
    readingMinutes: readingMinutes(body.split(/\s+/).filter(Boolean).length),
  };
}

// ---------- đọc file ----------

function readAll(): { meta: PostMeta; body: string }[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { data, content } = matter(raw);
      return { meta: parseMeta(file, data, content), body: content };
    });
}

const byDateDesc = (a: PostMeta, b: PostMeta) =>
  b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "vi");

// ---------- bài đã đăng: không phải nháp VÀ đã tới ngày đăng ----------

const VN_TZ = "Asia/Ho_Chi_Minh";

/** Ngày hôm nay (YYYY-MM-DD) theo giờ Việt Nam, không phụ thuộc múi giờ máy chủ. */
export const todayInVietnam = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: VN_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);

/**
 * Bài được hiện ra ngoài khi: không là nháp (tick Ẩn bài này, hoặc Trạng thái Nháp / Chờ duyệt) VÀ ngày đăng <= hôm nay (giờ VN).
 * Ngày đăng ở tương lai = bài LÊN LỊCH: ẩn ở danh sách, trang bài, bài liên quan, tìm kiếm, sitemap cho tới ngày đó.
 * Trang được dựng sẵn lúc build nên bài lên lịch chỉ hiện ra sau lần dựng lại (deploy) vào hoặc sau ngày đăng.
 */
export const isPublished = (post: Pick<PostMeta, "draft" | "date">, now: Date = new Date()): boolean =>
  !post.draft && post.date <= todayInVietnam(now);

/** Tên sách của MỌI bài (cả nháp / lên lịch), theo slug. Chỉ cho cột "Nguồn sách" ở danh sách quản trị Keystatic; đọc lỏng, file lỗi bị bỏ qua. */
export function getBookNamesBySlug(): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(POSTS_DIR)) return out;
  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (!file.endsWith(".md")) continue;
    try {
      const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
      const book = (data.source as { book?: unknown } | undefined)?.book;
      if (typeof book === "string" && book.trim()) out[file.replace(/\.md$/, "")] = book.trim();
    } catch {
      /* bỏ qua file lỗi */
    }
  }
  return out;
}

/** Dữ liệu để chấm SEO của một file bài (đọc lỏng: thiếu trường thì để trống, không báo lỗi). Null nếu file không đọc được. */
function seoInputOf(file: string): SeoInput | null {
  try {
    const text = (v: unknown) => (typeof v === "string" ? v : "");
    const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
    const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
    return {
      title: text(data.title),
      seoTitle: text(data.seoTitle),
      description: text(data.description),
      slug: file.replace(/\.md$/, ""),
      focusKeyword: text(data.focusKeyword),
      cover: text(data.cover),
      coverAlt: text(data.coverAlt),
      ogImage: text(data.ogImage),
      tags: list(data.tags),
      related: list(data.related),
      body: content,
    };
  } catch {
    return null;
  }
}

/**
 * Điểm SEO của MỌI bài (cả nháp / lên lịch), theo slug, chấm từ bản đã lưu. Chỉ cho cột "Điểm SEO" ở danh sách quản trị Keystatic
 * (/api/diem-seo, cùng cổng với trang xem trước); file lỗi bị bỏ qua.
 */
export function getSeoScoresBySlug(): Record<string, { score: number; level: "good" | "warn" | "bad" }> {
  const out: Record<string, { score: number; level: "good" | "warn" | "bad" }> = {};
  if (!fs.existsSync(POSTS_DIR)) return out;
  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (!file.endsWith(".md")) continue;
    const input = seoInputOf(file);
    if (!input) continue;
    const { score, level } = scoreSeo(input);
    out[input.slug] = { score, level };
  }
  return out;
}

/** Kết quả chấm đầy đủ của MỘT bài đã lưu, để hộp điểm SEO trong form đối chiếu với điểm chấm trực tiếp. Null nếu chưa có file. */
export function getSeoResultBySlug(slug: string): SeoResult | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null; // chặn đường dẫn lạ trước khi chạm vào file
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(POSTS_DIR, file))) return null;
  const input = seoInputOf(file);
  return input ? scoreSeo(input) : null;
}

/** Tất cả bài đã đăng (xem `isPublished`), mới nhất trước. */
export const getAllPosts = cache((): PostMeta[] =>
  readAll()
    .map((p) => p.meta)
    .filter((m) => isPublished(m))
    .sort(byDateDesc),
);

export const getPostsByTopic = (topicSlug: string): PostMeta[] =>
  getAllPosts().filter((p) => p.category === topicSlug);

// ---------- render Markdown → HTML (chạy trên server, không gửi JS cho người đọc) ----------

function textOf(node: Nodes): string {
  if (node.type === "text") return node.value;
  if ("children" in node) return node.children.map(textOf).join("");
  return "";
}

function collectH2(tree: Root): Heading[] {
  const out: Heading[] = [];
  const walk = (node: Nodes) => {
    if (node.type === "element" && (node as Element).tagName === "h2") {
      const el = node as Element;
      const id = typeof el.properties?.id === "string" ? el.properties.id : "";
      if (id) out.push({ id, text: textOf(el).trim() });
    }
    if ("children" in node) node.children.forEach(walk);
  };
  walk(tree);
  return out;
}

async function render(body: string): Promise<{ html: string; headings: Heading[] }> {
  // Không bật allowDangerousHtml: HTML thô trong Markdown bị bỏ → an toàn khi dùng dangerouslySetInnerHTML.
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeImageSize, { publicDir: path.join(process.cwd(), "public") }) // width / height thật cho ảnh trong bài: hết nhảy bố cục (CLS)
    .use(rehypeStringify);
  const tree = (await processor.run(processor.parse(body))) as Root;
  return { html: processor.stringify(tree), headings: collectH2(tree) };
}

/** Một bài đầy đủ (kèm HTML và mục lục). Trả về null nếu không có, đang là bản nháp hoặc chưa tới ngày đăng. */
export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const found = readAll().find((p) => p.meta.slug === slug && isPublished(p.meta));
  if (!found) return null;
  return { ...found.meta, ...(await render(found.body)) };
});

/** Trạng thái hiện của một bài: đã đăng / bản nháp (ẩn theo tick hoặc Trạng thái) / lên lịch (ngày đăng ở tương lai). */
export type PostState = "published" | "draft" | "scheduled";
export const getPostState = (post: Pick<PostMeta, "draft" | "date">, now: Date = new Date()): PostState =>
  post.draft ? "draft" : post.date > todayInVietnam(now) ? "scheduled" : "published";

/**
 * Bài để XEM TRƯỚC trong trang quản trị: lấy cả bản nháp và bài lên lịch (khác `getPost`).
 * CHỈ dùng ở route xem trước đã chặn truy cập (src/lib/preview.ts), không bao giờ dùng ở trang công khai.
 */
export async function getPostForPreview(slug: string): Promise<(Post & { state: PostState }) | null> {
  const found = readAll().find((p) => p.meta.slug === slug);
  if (!found) return null;
  return { ...found.meta, ...(await render(found.body)), state: getPostState(found.meta) };
}

/** Bài liên quan: bài chọn tay (nếu còn đăng) trước, rồi cùng chủ đề, thiếu thì bổ sung bài mới nhất chủ đề khác. */
export function getRelatedPosts(post: PostMeta, limit = 6): PostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const picked = post.related.flatMap((s) => all.filter((p) => p.slug === s));
  const others = all.filter((p) => !post.related.includes(p.slug));
  const same = others.filter((p) => p.category === post.category);
  const rest = others.filter((p) => p.category !== post.category);
  return [...picked, ...same, ...rest].slice(0, limit);
}

/** Số liệu cho Trang chủ (đếm từ nội dung, không viết cứng). */
export function getSiteStats() {
  const posts = getAllPosts();
  return {
    posts: posts.length,
    topics: getTopics().length,
    books: new Set(posts.map((p) => p.source.book)).size,
  };
}

export const countByTopic = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const t of getTopics()) counts[t.slug] = 0;
  for (const p of getAllPosts()) counts[p.category] = (counts[p.category] ?? 0) + 1;
  return counts;
};

export const topicBookCount = (topicSlug: string) =>
  new Set(getPostsByTopic(topicSlug).map((p) => p.source.book)).size;

export const topicAvgMinutes = (topicSlug: string) => {
  const list = getPostsByTopic(topicSlug);
  if (!list.length) return 0;
  return Math.round(list.reduce((s, p) => s + p.readingMinutes, 0) / list.length);
};
