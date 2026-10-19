// Công cụ tạo chuyển hướng nhanh từ trang quản trị (nút cạnh ô Slug, hộp "Thêm chuyển hướng"). CHỈ chạy phía server; route kiểm tra quyền quản trị (src/lib/admin-access.ts).
// Ghi đúng định dạng Keystatic dùng cho collection `redirects` (content/redirects/<tên>.json) nên mở lại trong admin vẫn sửa được.
// Mỗi lần tạo còn dọn chuỗi: chuyển hướng cũ đang trỏ tới đường dẫn vừa bị bỏ thì được trỏ thẳng về đích mới; chuyển hướng ngược (đích mới → cũ) bị xóa để khỏi vòng lặp.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { entryProblem, readRedirectFiles } from "./redirects";
import { KIND_PREFIX, REDIRECT_KINDS, SLUG_RE, type RedirectKind } from "./redirect-patterns";

export type RedirectItem = { slug: string; title: string };
export type ExistingRedirect = { file: string; kind: string; from: string; to: string };
export type CreateInput = { kind: string; oldSlug?: string; newSlug?: string; from?: string; to?: string; label?: string };
export type CreateResult = { ok: true; from: string; to: string; file: string; flattened: string[]; removed: string[] } | { ok: false; error: string };

const isKind = (k: string): k is RedirectKind => (REDIRECT_KINDS as readonly string[]).includes(k);

/** Danh sách mục của một loại có trang riêng (bài viết, chủ đề) để chọn trong hộp "Thêm chuyển hướng" */
export function listItems(kind: string, root: string = process.cwd()): RedirectItem[] {
  const dir = path.join(root, "content", kind === "Bài viết" ? "posts" : "topics");
  if (!KIND_PREFIX[kind as RedirectKind]) return [];
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir);
  } catch {
    return [];
  }
  const items: RedirectItem[] = [];
  for (const f of names) {
    const m = f.match(/^(.+)\.(md|json)$/);
    if (!m) continue;
    let title = m[1];
    try {
      const text = fs.readFileSync(path.join(dir, f), "utf8");
      const t = m[2] === "json" ? (JSON.parse(text) as { name?: string }).name : text.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
      if (t) title = t;
    } catch {
      /* giữ slug làm tiêu đề */
    }
    items.push({ slug: m[1], title });
  }
  return items.sort((a, b) => a.slug.localeCompare(b.slug));
}

const fileNameFor = (from: string) => from.replace(/^\//, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "chuyen-huong";

/** Một file chuyển hướng đã có (nội dung JSON thô); `sha` chỉ có khi đọc từ GitHub (cần để sửa / xóa file qua API) */
export type RedirectFile = { file: string; data: Record<string, unknown>; sha?: string };
export type RedirectPlan =
  | { ok: true; from: string; to: string; file: string; data: Record<string, unknown>; updates: RedirectFile[]; deletes: string[]; flattened: string[]; removed: string[] }
  | { ok: false; error: string };

const strOf = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * Lập kế hoạch tạo / sửa một chuyển hướng (THUẦN, không đọc / ghi file): file mới, các file cũ cần sửa đích, các file cần xóa.
 * Dùng chung cho ghi file ở máy local (createRedirect) và ghi qua GitHub ở web thật (src/lib/github-content.ts).
 */
export function planRedirect(input: CreateInput, existing: RedirectFile[]): RedirectPlan {
  const kind = input.kind;
  if (!isKind(kind)) return { ok: false, error: "Loại không hợp lệ." };
  const prefix = KIND_PREFIX[kind];
  let from = (input.from ?? "").trim();
  let to = (input.to ?? "").trim();
  if (prefix && input.oldSlug !== undefined) {
    const o = (input.oldSlug ?? "").trim();
    const n = (input.newSlug ?? "").trim();
    if (!SLUG_RE.test(o)) return { ok: false, error: "Slug cũ không hợp lệ." };
    if (!SLUG_RE.test(n)) return { ok: false, error: "Slug mới phải là chữ thường không dấu, nối bằng dấu gạch ngang (ví dụ: bai-moi)." };
    from = prefix + o;
    to = prefix + n;
  }
  const problem = entryProblem({ from, to });
  if (problem) return { ok: false, error: problem };

  const file = `${fileNameFor(from)}.json`;
  const updates: RedirectFile[] = [];
  const deletes: string[] = [];
  const flattened: string[] = [];
  const removed: string[] = [];
  for (const e of existing) {
    if (e.file === file) continue;
    const ef = strOf(e.data.from);
    const et = strOf(e.data.to);
    if (ef === from) {
      deletes.push(e.file); // cùng đường dẫn cũ: mục này thay thế mục cũ (sửa chuyển hướng có sẵn)
    } else if (ef === to) {
      deletes.push(e.file);
      removed.push(`${ef} → ${et}`);
    } else if (et === from) {
      updates.push({ file: e.file, data: { ...e.data, to }, sha: e.sha });
      flattened.push(`${ef} → ${to}`);
    }
  }
  const short = (p: string) => p.replace(/^\/(?:bai-viet|blog)\//, "");
  const label = (input.label ?? "").trim() || `${kind}: ${short(from)} → ${short(to)}`;
  return { ok: true, from, to, file, data: { label, kind, from, to, permanent: true }, updates, deletes, flattened, removed };
}

/** Đọc thô mọi file content/redirects/*.json ở máy (file hỏng bị bỏ qua: check-content sẽ báo) */
export function readRedirectFilesRaw(root: string = process.cwd()): RedirectFile[] {
  const dir = path.join(root, "content", "redirects");
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const out: RedirectFile[] = [];
  for (const f of names) {
    try {
      const v: unknown = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      if (typeof v === "object" && v !== null) out.push({ file: f, data: v as Record<string, unknown> });
    } catch {
      /* file hỏng */
    }
  }
  return out;
}

/** Tạo chuyển hướng bằng cách GHI FILE ở máy (chế độ local) */
export function createRedirect(input: CreateInput, root: string = process.cwd()): CreateResult {
  const plan = planRedirect(input, readRedirectFilesRaw(root));
  if (!plan.ok) return plan;
  const dir = path.join(root, "content", "redirects");
  fs.mkdirSync(dir, { recursive: true });
  const write = (file: string, data: Record<string, unknown>) => fs.writeFileSync(path.join(dir, file), `${JSON.stringify(data, null, 2)}
`);
  for (const f of plan.deletes) fs.unlinkSync(path.join(dir, f));
  for (const u of plan.updates) write(u.file, u.data);
  write(plan.file, plan.data);
  return { ok: true, from: plan.from, to: plan.to, file: plan.file, flattened: plan.flattened, removed: plan.removed };
}

/** Rút gọn danh sách file thô thành danh sách hiển thị trong hộp "Thêm chuyển hướng" */
export function toExisting(files: RedirectFile[]): ExistingRedirect[] {
  return files.map((f) => {
    const k = strOf(f.data.kind);
    return { file: f.file, kind: isKind(k) ? k : "Khác", from: strOf(f.data.from), to: strOf(f.data.to) };
  });
}

/** Các chuyển hướng đang có ở máy / bản đã build (để chọn sửa trong hộp "Thêm chuyển hướng") */
export const listExisting = (root: string = process.cwd()): ExistingRedirect[] => toExisting(readRedirectFilesRaw(root));

/**
 * Trạng thái của một slug để trang quản trị quyết định có bắt tạo chuyển hướng trước khi đổi slug hay không.
 * `needsRedirect` = bài ĐÃ ĐĂNG (không nháp / lên lịch, không phải bài mẫu demo-*) hoặc chủ đề đang có, và chưa có chuyển hướng từ đường dẫn cũ.
 */
export function slugStatus(kind: string, slug: string, root: string = process.cwd()): { live: boolean; hasRedirect: boolean; needsRedirect: boolean } {
  const prefix = KIND_PREFIX[kind as RedirectKind];
  if (!prefix || !SLUG_RE.test(slug)) return { live: false, hasRedirect: false, needsRedirect: false };
  let live = false;
  if (kind === "Chủ đề") live = fs.existsSync(path.join(root, "content", "topics", `${slug}.json`));
  else {
    try {
      const { data } = matter(fs.readFileSync(path.join(root, "content", "posts", `${slug}.md`), "utf8"));
      const d = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? "");
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      live = data.draft !== true && data.status !== "draft" && data.status !== "review" && /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= today && !slug.startsWith("demo-");
    } catch {
      live = false;
    }
  }
  const hasRedirect = readRedirectFiles(root).some((e) => e.from === prefix + slug);
  return { live, hasRedirect, needsRedirect: live && !hasRedirect };
}
