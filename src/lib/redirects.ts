// Chuyển hướng (redirects): bảng "đường dẫn cũ → đường dẫn mới" do Keystatic lưu ở content/redirects/<tên>.json (menu "Chuyển hướng").
// Dùng ở 3 nơi: next.config.ts (áp dụng lúc build / khởi động server), scripts/check-content.mjs (kiểm tra), tests. KHÔNG import alias `@/` trong file này
// vì next.config.ts không dùng được alias (chỉ import tương đối); chỉ dùng node:fs / node:path. Mẫu ký tự ở ./redirect-patterns (thuần, dùng được ở trình duyệt).
//
// AN TOÀN: một `source` sai cú pháp làm `next build` / `next dev` sập. Vì vậy:
//  - ô nhập ở admin bị ép đúng mẫu (REDIRECT_FROM_RE, REDIRECT_TO_RE; keystatic.config.ts dùng đúng các hằng này),
//  - buildRedirects() vẫn tự bỏ mục sai / trùng / vòng lặp và gộp chuỗi nối tiếp về đích cuối, để web không bao giờ hỏng
//    (check-content báo LỖI để người sửa biết mục nào bị bỏ).

import fs from "node:fs";
import path from "node:path";
import { REDIRECT_FROM_RE, REDIRECT_TO_RE, REDIRECTS_MAX, RESERVED_PREFIXES, STATIC_ROUTES } from "./redirect-patterns.ts";

export type RedirectEntry = { file: string; from: string; to: string; permanent: boolean };
export type NextRedirect = { source: string; destination: string; permanent: boolean };

export { REDIRECT_FROM_RE, REDIRECT_TO_RE, RESERVED_PREFIXES, STATIC_ROUTES, REDIRECTS_MAX };

const isReserved = (p: string) => RESERVED_PREFIXES.some((r) => p === r || p.startsWith(`${r}/`));
const isInternal = (to: string) => to.startsWith("/");

/** Đọc các file content/redirects/*.json (hỏng / thiếu ô thì trả mục với ô rỗng để nơi gọi báo lỗi). Không có thư mục thì trả []. */
export function readRedirectFiles(root: string = process.cwd()): RedirectEntry[] {
  const dir = path.join(root, "content", "redirects");
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
  return names.map((f) => {
    let raw: Record<string, unknown> = {};
    try {
      const v: unknown = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      if (typeof v === "object" && v !== null) raw = v as Record<string, unknown>;
    } catch {
      /* mục hỏng: from / to rỗng, bị bỏ ở buildRedirects và báo lỗi ở check-content */
    }
    const s = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
    return { file: f, from: s("from"), to: s("to"), permanent: raw.permanent !== false };
  });
}

/** Lý do một mục không dùng được (null = hợp lệ về hình thức; chưa kiểm tra đích có tồn tại hay không) */
export function entryProblem(e: Pick<RedirectEntry, "from" | "to">): string | null {
  if (!e.from) return 'thiếu "đường dẫn cũ"';
  if (!e.to) return 'thiếu "đường dẫn mới"';
  if (!REDIRECT_FROM_RE.test(e.from)) return `đường dẫn cũ "${e.from}" sai mẫu (bắt đầu bằng /, chữ thường không dấu, không dấu cách, không ? # : * ( ), không / ở cuối)`;
  if (isReserved(e.from)) return `đường dẫn cũ "${e.from}" thuộc phần hệ thống (${RESERVED_PREFIXES.join(", ")}), không được chuyển hướng`;
  if (!REDIRECT_TO_RE.test(e.to)) return `đường dẫn mới "${e.to}" sai mẫu (đường dẫn trong site như /bai-viet/ten-bai hoặc địa chỉ https://...)`;
  if (e.to === e.from) return "đường dẫn mới trùng đường dẫn cũ";
  return null;
}

/** Đích cuối cùng sau khi đi theo các chuyển hướng nối tiếp; null nếu gặp vòng lặp / quá dài */
export function finalTarget(start: string, bySource: Map<string, string>): string | null {
  const seen = new Set<string>();
  let cur = start;
  while (bySource.has(cur)) {
    if (seen.has(cur) || seen.size > 10) return null;
    seen.add(cur);
    cur = bySource.get(cur)!;
  }
  return cur;
}

/** Danh sách cho `redirects()` của next.config.ts: bỏ mục sai / trùng / vòng lặp, gộp chuỗi nối tiếp về đích cuối, tối đa REDIRECTS_MAX mục */
export function buildRedirects(entries: RedirectEntry[]): NextRedirect[] {
  const valid = entries.filter((e) => entryProblem(e) === null);
  const firstByFrom = new Map<string, RedirectEntry>();
  for (const e of valid) if (!firstByFrom.has(e.from)) firstByFrom.set(e.from, e); // trùng đường dẫn cũ: giữ mục đầu (theo tên file)
  const bySource = new Map([...firstByFrom.values()].map((e) => [e.from, e.to] as const));
  const out: NextRedirect[] = [];
  for (const e of firstByFrom.values()) {
    const dest = finalTarget(e.from, bySource);
    if (!dest || dest === e.from || (isInternal(dest) && isReserved(dest))) continue; // vòng lặp hoặc đích hệ thống
    out.push({ source: e.from, destination: dest, permanent: e.permanent });
  }
  return out.slice(0, REDIRECTS_MAX);
}
