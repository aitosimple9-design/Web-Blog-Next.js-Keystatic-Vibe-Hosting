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
import type { Root, Element, Nodes } from "hast";
import { topicBySlug, topics } from "@/config/topics";
import { readingMinutes } from "@/lib/format";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type Heading = { id: string; text: string };

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  source: { book: string; author: string };
  cover?: string;
  draft: boolean;
  readingMinutes: number;
};

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
      `category "${category}" chưa có trong src/config/topics.ts (hiện có: ${topics
        .map((t) => t.slug)
        .join(", ")})`,
    );
  }
  const source = data.source as Record<string, unknown> | undefined;
  if (!source || typeof source !== "object") {
    fail(file, 'thiếu khối bắt buộc "source" (book, author)');
  }
  const cover = typeof data.cover === "string" && data.cover ? data.cover : undefined;

  return {
    slug,
    title: str(file, data, "title"),
    description,
    category,
    date: toIsoDate(file, data.date),
    source: { book: str(file, source, "book"), author: str(file, source, "author") },
    cover,
    draft: data.draft === true,
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

/** Tất cả bài đã đăng (bỏ `draft: true`), mới nhất trước. */
export const getAllPosts = cache((): PostMeta[] =>
  readAll()
    .map((p) => p.meta)
    .filter((m) => !m.draft)
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
  const processor = unified().use(remarkParse).use(remarkRehype).use(rehypeSlug).use(rehypeStringify);
  const tree = (await processor.run(processor.parse(body))) as Root;
  return { html: processor.stringify(tree), headings: collectH2(tree) };
}

/** Một bài đầy đủ (kèm HTML và mục lục). Trả về null nếu không có hoặc đang là bản nháp. */
export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const found = readAll().find((p) => p.meta.slug === slug && !p.meta.draft);
  if (!found) return null;
  return { ...found.meta, ...(await render(found.body)) };
});

/** Bài liên quan: cùng chủ đề, trừ bài hiện tại; thiếu thì bổ sung bài mới nhất chủ đề khác. */
export function getRelatedPosts(post: PostMeta, limit = 6): PostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const same = all.filter((p) => p.category === post.category);
  const rest = all.filter((p) => p.category !== post.category);
  return [...same, ...rest].slice(0, limit);
}

/** Số liệu cho Trang chủ (đếm từ nội dung, không viết cứng). */
export function getSiteStats() {
  const posts = getAllPosts();
  return {
    posts: posts.length,
    topics: topics.length,
    books: new Set(posts.map((p) => p.source.book)).size,
  };
}

export const countByTopic = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const t of topics) counts[t.slug] = 0;
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
