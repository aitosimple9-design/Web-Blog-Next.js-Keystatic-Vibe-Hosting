// Đọc / ghi nội dung trên GitHub bằng token đăng nhập của CHÍNH người quản trị (chế độ GitHub của Keystatic, web thật không ghi được file).
// Chỉ gọi sau khi `adminToken()` (src/lib/admin-access.ts) đã xác minh người gọi có quyền push. Token không bao giờ ghi log hay trả ra ngoài.
import { githubHeaders } from "./admin-access";
import { GITHUB_REPO } from "./github-repo";
import type { RedirectFile, RedirectPlan } from "./redirect-tools";
import { SLUG_RE } from "../../shared/redirect-patterns";

const API = `https://api.github.com/repos/${GITHUB_REPO}`;
const REDIRECTS_DIR = "content/redirects";
const MAX_REDIRECT_FILES = 300;

export class GithubError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Tên nhánh hợp lệ (chặn ký tự lạ, `..`, dấu `/` đầu / cuối) trước khi đưa vào đường dẫn API */
export const validBranch = (b: unknown): b is string =>
  typeof b === "string" && /^[A-Za-z0-9._/-]{1,120}$/.test(b) && !b.includes("..") && !b.startsWith("/") && !b.endsWith("/");

const enc = (s: string) => encodeURIComponent(s).replace(/%2F/g, "/");

async function gh(token: string, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${API}${path}`, { ...init, headers: { ...githubHeaders(token), ...(init.headers ?? {}) }, cache: "no-store" });
}

async function fail(res: Response): Promise<never> {
  let message = `GitHub trả lỗi ${res.status}`;
  try {
    const j = (await res.json()) as { message?: string };
    if (j.message) message = j.message;
  } catch {
    /* giữ thông báo mặc định */
  }
  throw new GithubError(res.status, message);
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");

/** Các file chuyển hướng ở một nhánh (404 = chưa có thư mục = rỗng) */
export async function listRedirectsGitHub(token: string, branch: string): Promise<RedirectFile[]> {
  const res = await gh(token, `/contents/${REDIRECTS_DIR}?ref=${enc(branch)}`);
  if (res.status === 404) return [];
  if (!res.ok) return fail(res);
  const items = ((await res.json()) as { name: string; type: string; sha: string }[]).filter((i) => i.type === "file" && i.name.endsWith(".json")).slice(0, MAX_REDIRECT_FILES);
  const files = await Promise.all(
    items.map(async (i): Promise<RedirectFile | null> => {
      const r = await gh(token, `/contents/${REDIRECTS_DIR}/${enc(i.name)}?ref=${enc(branch)}`, { headers: { Accept: "application/vnd.github.raw+json" } });
      if (!r.ok) return null;
      try {
        const v: unknown = JSON.parse(await r.text());
        return typeof v === "object" && v !== null ? { file: i.name, data: v as Record<string, unknown>, sha: i.sha } : null;
      } catch {
        return null;
      }
    }),
  );
  return files.filter((f): f is RedirectFile => f !== null);
}

/** Áp dụng kế hoạch chuyển hướng bằng các commit lên nhánh (mỗi file một commit). `existing` là kết quả listRedirectsGitHub trước đó (để biết sha). */
export async function applyPlanGitHub(token: string, branch: string, plan: Extract<RedirectPlan, { ok: true }>, existing: RedirectFile[]): Promise<void> {
  const shaOf = (file: string) => existing.find((e) => e.file === file)?.sha;
  const put = async (file: string, data: Record<string, unknown>, message: string) => {
    const sha = shaOf(file);
    const res = await gh(token, `/contents/${REDIRECTS_DIR}/${enc(file)}`, {
      method: "PUT",
      body: JSON.stringify({ message, content: b64(`${JSON.stringify(data, null, 2)}\n`), branch, ...(sha ? { sha } : {}) }),
    });
    if (!res.ok) await fail(res);
  };
  for (const file of plan.deletes) {
    const sha = shaOf(file);
    if (!sha) continue;
    const res = await gh(token, `/contents/${REDIRECTS_DIR}/${enc(file)}`, {
      method: "DELETE",
      body: JSON.stringify({ message: `chore(redirects): bỏ chuyển hướng ${file} (bị thay thế)`, sha, branch }),
    });
    if (!res.ok) await fail(res);
  }
  for (const u of plan.updates) await put(u.file, u.data, `chore(redirects): trỏ ${String(u.data.from)} thẳng về ${plan.to}`);
  await put(plan.file, plan.data, `chore(redirects): ${plan.from} → ${plan.to}`);
}

/** Nội dung thô của một bài ở một nhánh (null nếu chưa có file) */
export async function fetchPostRaw(token: string, branch: string, slug: string): Promise<string | null> {
  if (!SLUG_RE.test(slug) || !validBranch(branch)) return null;
  const res = await gh(token, `/contents/content/posts/${slug}.md?ref=${enc(branch)}`, { headers: { Accept: "application/vnd.github.raw+json" } });
  if (res.status === 404) return null;
  if (!res.ok) return fail(res);
  return res.text();
}

/** Câu báo lỗi dễ hiểu cho người soạn bài */
export function friendlyGithubError(e: unknown): string {
  if (e instanceof GithubError) {
    if (e.status === 404) return "Không thấy nhánh hoặc file trên GitHub (nhánh đã bị xóa?).";
    if (e.status === 401) return "Phiên đăng nhập GitHub hết hạn: tải lại trang quản trị và đăng nhập lại.";
    if (e.status === 403 || e.status === 409 || e.status === 422) {
      return "GitHub từ chối ghi vào nhánh này (nhánh chính được bảo vệ?). Hãy bấm New branch trong Keystatic, làm trên nhánh mới rồi thử lại. Chi tiết: " + e.message;
    }
    return e.message;
  }
  return "Không gọi được GitHub, thử lại sau.";
}
