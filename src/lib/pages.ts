// Đọc nội dung từng TRANG do Keystatic lưu ở content/pages/<trang>.json (nhóm "Trang" ở menu quản trị). Chỉ chạy phía server.
// Hiện có: Trang chủ (`trang-chu.json`). An toàn khi file chưa có / sai: từng ô thiếu hoặc sai thì dùng nội dung mẫu ở src/config/profile.ts,
// site không bao giờ lỗi. Ảnh: đọc kích thước thật bằng `image-size` (không nhảy bố cục); file ảnh mất thì dùng ảnh mặc định.

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { imageSize } from "image-size";
import { profile, story, principles, shelf, home } from "@/config/profile";
import {
  articleDefaults,
  blogDefaults,
  bookDefaults,
  notFoundDefaults,
  type ArticlePageTexts,
  type BlogPageTexts,
  type BookPageTexts,
  type NotFoundPageTexts,
} from "@/config/page-texts";

const DIR = path.join(process.cwd(), "content", "pages");

export const STORY_PARAGRAPHS_MAX = 8;
export const MARQUEE_WORDS_MAX = 8;
export const PRINCIPLES_MAX = 4;
export const SHELF_BOOKS_MAX = 12;
/** Vị trí cắt ảnh Câu chuyện khi khung cắt bớt ảnh (giá trị CSS object-position) */
export const STORY_IMAGE_POSITIONS = ["50% 50%", "50% 20%", "50% 80%", "20% 50%", "80% 50%"] as const;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined);
const obj = (v: unknown): Obj => (isObj(v) ? v : {});

function readJson(name: string): Obj {
  try {
    return obj(JSON.parse(fs.readFileSync(path.join(DIR, `${name}.json`), "utf8")));
  } catch {
    return {};
  }
}

// Kích thước ảnh trong public/ (đường dẫn công khai bắt đầu bằng "/"); không đọc được thì undefined
function dims(src: string | undefined): { width: number; height: number } | undefined {
  if (!src || !src.startsWith("/")) return undefined;
  try {
    const { width, height } = imageSize(fs.readFileSync(path.join(process.cwd(), "public", src)));
    return width && height ? { width, height } : undefined;
  } catch {
    return undefined;
  }
}

// Tên sách theo slug (tên file trong content/books); không có thì undefined
function bookName(slug: string): string | undefined {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
  try {
    const raw = obj(JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "books", `${slug}.json`), "utf8")));
    return text(raw.name);
  } catch {
    return undefined;
  }
}

export type HomePage = {
  name: string;
  positioning: string;
  greeting: string;
  ctaLabel: string;
  followLabel: string;
  /** Chữ cái đầu trên hai cánh cửa mở đầu trang (suy ra từ tên) */
  curtain: { left: string; right: string };
  portrait: { src: string; alt: string; width: number; height: number };
  statLabels: { posts: string; books: string; topics: string };
  story: { eyebrow: string; title: string; paragraphs: string[]; image: { src: string; alt: string; position: string } };
  principles: { title: string; dek: string; items: { title: string; text: string }[] };
  shelf: { title: string; dek: string; books: { title: string; topic: string }[] };
  featured: { title: string; linkLabel: string };
  connect: { eyebrow: string; title: string; text: string };
};

// Hai cánh cửa mang chữ cái đầu của nửa đầu và nửa sau của tên: "Trần Ngọc Hoàng Ni" → "T·N" | "H·N"
function curtainFrom(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  const half = Math.ceil(words.length / 2);
  const initials = (ws: string[]) => ws.map((w) => w[0]?.toUpperCase() ?? "").join("·");
  return words.length < 2
    ? { left: initials(words), right: initials(words) }
    : { left: initials(words.slice(0, half)), right: initials(words.slice(half)) };
}

export const getHomePage = cache((): HomePage => {
  const raw = readJson("trang-chu");
  const rStory = obj(raw.story);
  const rPrinciples = obj(raw.principles);
  const rShelf = obj(raw.shelf);
  const rFeatured = obj(raw.featured);
  const rConnect = obj(raw.connect);
  const rStats = obj(raw.statLabels);

  const name = text(raw.name) ?? profile.name;

  const portraitSrc = text(raw.portrait);
  const portraitDims = dims(portraitSrc);
  const portrait =
    portraitSrc && portraitDims
      ? { src: portraitSrc, alt: text(raw.portraitAlt) ?? profile.portrait.alt, ...portraitDims }
      : { ...profile.portrait };

  const storyImageSrc = text(raw.storyImage);
  const position = STORY_IMAGE_POSITIONS.find((p) => p === raw.storyImagePosition) ?? profile.storyImage.position;
  const storyImage =
    storyImageSrc && dims(storyImageSrc)
      ? { src: storyImageSrc, alt: text(raw.storyImageAlt) ?? profile.storyImage.alt, position }
      : { ...profile.storyImage, position };

  const paragraphs = Array.isArray(rStory.paragraphs)
    ? rStory.paragraphs.slice(0, STORY_PARAGRAPHS_MAX).flatMap((p) => (typeof p === "string" && text(p) ? [p.trim()] : []))
    : [];

  const items = Array.isArray(rPrinciples.items)
    ? rPrinciples.items.slice(0, PRINCIPLES_MAX).flatMap((i) => {
        const o = obj(i);
        const t = text(o.title);
        const d = text(o.text);
        return t && d ? [{ title: t, text: d }] : [];
      })
    : [];

  // Tủ sách: chọn sách và chủ đề từ mục Sách / Chủ đề (lưu slug); sách đã bị xóa thì bỏ qua
  const books = Array.isArray(rShelf.books)
    ? rShelf.books.slice(0, SHELF_BOOKS_MAX).flatMap((b) => {
        const o = obj(b);
        const title = typeof o.book === "string" ? bookName(o.book) : undefined;
        return title ? [{ title, topic: text(o.topic) ?? "" }] : [];
      })
    : [];

  return {
    name,
    positioning: text(raw.positioning) ?? profile.positioning,
    greeting: text(raw.greeting) ?? home.greeting,
    ctaLabel: text(raw.ctaLabel) ?? home.ctaLabel,
    followLabel: text(raw.followLabel) ?? home.followLabel,
    curtain: curtainFrom(name),
    portrait,
    statLabels: {
      posts: text(rStats.posts) ?? home.statLabels.posts,
      books: text(rStats.books) ?? home.statLabels.books,
      topics: text(rStats.topics) ?? home.statLabels.topics,
    },
    story: {
      eyebrow: text(rStory.eyebrow) ?? home.storyEyebrow,
      title: text(rStory.title) ?? story.title,
      paragraphs: paragraphs.length > 0 ? paragraphs : [...story.paragraphs],
      image: storyImage,
    },
    principles: {
      title: text(rPrinciples.title) ?? principles.title,
      dek: text(rPrinciples.dek) ?? principles.dek,
      items: items.length > 0 ? items : principles.items.map((i) => ({ ...i })),
    },
    shelf: {
      title: text(rShelf.title) ?? shelf.title,
      dek: text(rShelf.dek) ?? shelf.dek,
      // Có khóa `books` trong file (kể cả rỗng) thì theo đúng danh sách của admin: rỗng = ẨN khối Tủ sách. Chưa có khóa thì dùng danh sách mẫu.
      books: Array.isArray(rShelf.books) ? books : shelf.books.map((b) => ({ ...b })),
    },
    featured: {
      title: text(rFeatured.title) ?? home.featured.title,
      linkLabel: text(rFeatured.linkLabel) ?? home.featured.linkLabel,
    },
    connect: {
      eyebrow: text(rConnect.eyebrow) ?? home.connect.eyebrow,
      title: text(rConnect.title) ?? home.connect.title,
      text: text(rConnect.text) ?? home.connect.text,
    },
  };
});

// ---------------------------------------------------------------------------------------------------------------------
// Các trang con (Book, Blog, Trang bài, 404): chữ lấy từ content/pages/<trang>.json, ô thiếu hoặc để trống thì dùng mặc định ở src/config/page-texts.ts.
// ---------------------------------------------------------------------------------------------------------------------

// Trộn chữ của admin vào bản mặc định: chuỗi → chuỗi không rỗng; danh sách chữ → danh sách không rỗng; nhóm → đệ quy
function pick<T>(defaults: T, raw: unknown): T {
  if (typeof defaults === "string") return (text(raw) ?? defaults) as T;
  if (Array.isArray(defaults)) {
    const list = Array.isArray(raw) ? raw.flatMap((v) => (typeof v === "string" && text(v) ? [v.trim()] : [])) : [];
    return (list.length > 0 ? list : defaults) as T;
  }
  if (isObj(defaults)) {
    const r = obj(raw);
    return Object.fromEntries(Object.entries(defaults).map(([k, d]) => [k, pick(d, r[k])])) as T;
  }
  return defaults;
}

export const getBookPage = cache((): BookPageTexts => {
  const t = pick(bookDefaults, readJson("book"));
  return { ...t, marquee: t.marquee.slice(0, MARQUEE_WORDS_MAX) };
});
export const getBlogPage = cache((): BlogPageTexts => pick(blogDefaults, readJson("blog")));
export const getArticlePage = cache((): ArticlePageTexts => pick(articleDefaults, readJson("bai-viet")));
export const getNotFoundPage = cache((): NotFoundPageTexts => pick(notFoundDefaults, readJson("404")));
