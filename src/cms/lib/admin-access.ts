// Ai được gọi các API / trang dành riêng cho người quản trị (điểm SEO, tên sách, chuyển hướng nhanh, xem trước bài nháp)?
// Các nơi này trả cả bài nháp / lên lịch nên KHÔNG được lộ ra internet.
//  - Keystatic chế độ LOCAL (máy soạn bài, không VERCEL): cho qua (src/lib/preview.ts).
//  - Keystatic chế độ GITHUB (web thật): chỉ người ĐÃ ĐĂNG NHẬP Keystatic bằng GitHub và có quyền GHI vào repo. Keystatic lưu token đăng nhập ở
//    cookie `keystatic-gh-access-token`; ta hỏi GitHub "token này có quyền push vào repo không" (kết quả nhớ 60 giây, chỉ lưu bản băm của token).
// Mọi trường hợp khác (không cookie, token hết hạn, không quyền, GitHub lỗi) = KHÔNG cho qua. Token chỉ dùng phía server, không bao giờ trả ra ngoài hay ghi log.
import { createHash } from "node:crypto";
import { GITHUB_API, GITHUB_REPO } from "./github-repo";
import { isPreviewEnabled } from "./preview";

export const GITHUB_TOKEN_COOKIE = "keystatic-gh-access-token";
const CACHE_MS = 60_000;
const cache = new Map<string, { ok: boolean; until: number }>();

const isGithubMode = () => process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github";

/** Lấy token đăng nhập GitHub của Keystatic từ header Cookie (null nếu không có) */
export function tokenFromCookieHeader(header: string | null | undefined): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0 || part.slice(0, i).trim() !== GITHUB_TOKEN_COOKIE) continue;
    try {
      const v = decodeURIComponent(part.slice(i + 1).trim());
      return v || null;
    } catch {
      return null;
    }
  }
  return null;
}

export const githubHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "web-blog-admin",
});

/** Token này có quyền ghi (push) vào repo nội dung không? */
export async function tokenCanPush(token: string): Promise<boolean> {
  const key = createHash("sha256").update(token).digest("hex");
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return hit.ok;
  let ok = false;
  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}`, { headers: githubHeaders(token), cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { permissions?: { push?: boolean } };
      ok = data.permissions?.push === true;
    }
  } catch {
    ok = false;
  }
  cache.set(key, { ok, until: Date.now() + CACHE_MS });
  if (cache.size > 200) for (const [k, v] of cache) if (v.until < Date.now()) cache.delete(k);
  return ok;
}

/** Người gọi (theo header Cookie) có phải quản trị viên không? */
export async function isAdminCookieHeader(cookieHeader: string | null | undefined): Promise<boolean> {
  if (!isGithubMode()) return isPreviewEnabled();
  const token = tokenFromCookieHeader(cookieHeader);
  return token ? tokenCanPush(token) : false;
}

export const isAdminRequest = (request: Request) => isAdminCookieHeader(request.headers.get("cookie"));

/** Token của người gọi (chỉ chế độ GitHub, và đã được xác minh có quyền push); null nếu không */
export async function adminToken(request: Request): Promise<string | null> {
  if (!isGithubMode()) return null;
  const token = tokenFromCookieHeader(request.headers.get("cookie"));
  return token && (await tokenCanPush(token)) ? token : null;
}
