// Danh sách và TẠO NHANH mục Sách / Chủ đề / Chủ đề con cho hộp "Thêm mới" trong ô chọn của form bài (src/cms/ui/EntryPicker.tsx,
// API /api/danh-muc). File tạo ra có đúng dạng Keystatic tự ghi (content/<mục>/<slug>.json, bỏ trống ô ảnh) nên mở lại trong
// Keystatic để thêm ảnh / sửa vẫn bình thường. Chỉ chạy phía server (chế độ local ghi file; chế độ GitHub commit qua github-content.ts).
import fs from "node:fs";
import path from "node:path";
import { slugify } from "../../shared/seo-score";
import { SLUG_RE } from "../../shared/redirect-patterns";

export const ENTRY_KINDS = ["books", "topics", "subtopics"] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];
export const isEntryKind = (v: unknown): v is EntryKind => typeof v === "string" && (ENTRY_KINDS as readonly string[]).includes(v);

export const ENTRY_DIR: Record<EntryKind, string> = { books: "content/books", topics: "content/topics", subtopics: "content/subtopics" };
const NOUN: Record<EntryKind, string> = { books: "sách", topics: "chủ đề", subtopics: "chủ đề con" };

export type EntryItem = { slug: string; name: string; topic?: string; order?: number };
export type EntryInput = { name?: unknown; description?: unknown; topic?: unknown; order?: unknown };
export type EntryPlan = { ok: true; slug: string; file: string; data: Record<string, unknown>; item: EntryItem } | { ok: false; error: string };

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Rút một mục hiển thị từ nội dung JSON thô (null nếu hỏng) */
export function itemFromRaw(slug: string, raw: unknown): EntryItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const item: EntryItem = { slug, name: text(r.name) || slug };
  if (text(r.topic)) item.topic = text(r.topic);
  if (typeof r.order === "number") item.order = r.order;
  return item;
}

const byName = (a: EntryItem, b: EntryItem) => a.name.localeCompare(b.name, "vi");

/** Các mục của một loại, đọc LỎNG từ content/ (file hỏng bị bỏ qua) */
export function listEntries(kind: EntryKind, root: string = process.cwd()): EntryItem[] {
  const dir = path.join(root, "content", kind);
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const out: EntryItem[] = [];
  for (const f of names) {
    try {
      const item = itemFromRaw(f.slice(0, -5), JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
      if (item) out.push(item);
    } catch {
      /* file hỏng */
    }
  }
  return out.sort(byName);
}

/** Kiểm tra dữ liệu nhập và dựng nội dung file. `existing` = các mục cùng loại đang có; `topics` = danh sách chủ đề (cho chủ đề con) */
export function planEntry(kind: EntryKind, input: EntryInput, existing: EntryItem[], topics: EntryItem[] = []): EntryPlan {
  const name = text(input.name);
  if (!name) return { ok: false, error: `Cần nhập tên ${NOUN[kind]}.` };
  if (name.length > 120) return { ok: false, error: "Tên dài quá 120 ký tự." };
  const slug = slugify(name);
  if (!slug || !SLUG_RE.test(slug)) return { ok: false, error: "Tên cần có chữ hoặc số để tạo slug." };
  if (kind === "subtopics" && slug === "trang") return { ok: false, error: 'Slug "trang" dành riêng cho phân trang, hãy đổi tên.' };
  if (existing.some((e) => e.slug === slug)) return { ok: false, error: `Đã có ${NOUN[kind]} dùng slug "${slug}". Hãy chọn mục đó hoặc đổi tên.` };

  let data: Record<string, unknown>;
  if (kind === "books") {
    data = { name };
  } else {
    const description = text(input.description);
    if (!description) return { ok: false, error: "Cần nhập mô tả ngắn." };
    if (description.length > 200) return { ok: false, error: "Mô tả dài quá 200 ký tự." };
    const given = Number(input.order);
    const order = Number.isInteger(given) && given > 0 ? given : existing.reduce((m, e) => Math.max(m, e.order ?? 0), 0) + 1;
    if (kind === "topics") {
      data = { name, order, description };
    } else {
      const topic = text(input.topic);
      if (!topic) return { ok: false, error: "Cần chọn chủ đề cho chủ đề con." };
      if (!topics.some((t) => t.slug === topic)) return { ok: false, error: "Chủ đề đã chọn không tồn tại." };
      data = { name, topic, order, description };
    }
  }
  const item: EntryItem = { slug, name, ...(typeof data.topic === "string" ? { topic: data.topic } : {}), ...(typeof data.order === "number" ? { order: data.order } : {}) };
  return { ok: true, slug, file: `${slug}.json`, data, item };
}

/** Tạo mục bằng cách GHI FILE ở máy (chế độ local). Không ghi đè file đã có */
export function createEntryLocal(kind: EntryKind, input: EntryInput, root: string = process.cwd()): EntryPlan {
  const plan = planEntry(kind, input, listEntries(kind, root), kind === "subtopics" ? listEntries("topics", root) : []);
  if (!plan.ok) return plan;
  const dir = path.join(root, "content", kind);
  fs.mkdirSync(dir, { recursive: true });
  try {
    fs.writeFileSync(path.join(dir, plan.file), `${JSON.stringify(plan.data, null, 2)}\n`, { flag: "wx" });
  } catch {
    return { ok: false, error: `Đã có ${NOUN[kind]} dùng slug "${plan.slug}".` };
  }
  return plan;
}
