// Công cụ tạo chuyển hướng nhanh từ trang quản trị (nút cạnh ô Slug, hộp "Thêm chuyển hướng"). CHỈ chạy phía server, máy soạn bài (cổng isPreviewEnabled ở route).
// Ghi đúng định dạng Keystatic dùng cho collection `redirects` (content/redirects/<tên>.json) nên mở lại trong admin vẫn sửa được.
// Mỗi lần tạo còn dọn chuỗi: chuyển hướng cũ đang trỏ tới đường dẫn vừa bị bỏ thì được trỏ thẳng về đích mới; chuyển hướng ngược (đích mới → cũ) bị xóa để khỏi vòng lặp.
import fs from "node:fs";
import path from "node:path";
import { entryProblem, readRedirectFiles } from "./redirects";
import { KIND_PREFIX, REDIRECT_KINDS, SLUG_RE, type RedirectKind } from "./redirect-patterns";

export type RedirectItem = { slug: string; title: string };
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

export function createRedirect(input: CreateInput, root: string = process.cwd()): CreateResult {
  const kind = input.kind;
  if (!isKind(kind)) return { ok: false, error: "Loại không hợp lệ." };
  const prefix = KIND_PREFIX[kind];
  let from = (input.from ?? "").trim();
  let to = (input.to ?? "").trim();
  if (prefix) {
    const o = (input.oldSlug ?? "").trim();
    const n = (input.newSlug ?? "").trim();
    if (!SLUG_RE.test(o)) return { ok: false, error: "Slug cũ không hợp lệ." };
    if (!SLUG_RE.test(n)) return { ok: false, error: "Slug mới phải là chữ thường không dấu, nối bằng dấu gạch ngang (ví dụ: bai-moi)." };
    from = prefix + o;
    to = prefix + n;
  }
  const problem = entryProblem({ from, to });
  if (problem) return { ok: false, error: problem };

  const dir = path.join(root, "content", "redirects");
  fs.mkdirSync(dir, { recursive: true });
  const flattened: string[] = [];
  const removed: string[] = [];
  const write = (file: string, data: Record<string, unknown>) => fs.writeFileSync(path.join(dir, file), `${JSON.stringify(data, null, 2)}\n`);
  const read = (file: string): Record<string, unknown> => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as Record<string, unknown>;

  const file = `${fileNameFor(from)}.json`;
  for (const e of readRedirectFiles(root)) {
    if (e.file === file) continue;
    try {
      if (e.from === to) {
        fs.unlinkSync(path.join(dir, e.file));
        removed.push(`${e.from} → ${e.to}`);
      } else if (e.to === from) {
        write(e.file, { ...read(e.file), to });
        flattened.push(`${e.from} → ${to}`);
      }
    } catch {
      /* file hỏng: để check-content báo */
    }
  }
  const label = (input.label ?? "").trim() || `${kind}: ${from.replace(/^\/(?:bai-viet|blog)\//, "")} → ${to.replace(/^\/(?:bai-viet|blog)\//, "")}`;
  write(file, { label, kind, from, to, permanent: true });
  return { ok: true, from, to, file, flattened, removed };
}
