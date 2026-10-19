import { afterEach, describe, expect, it, vi } from "vitest";
import { isAdminCookieHeader, tokenFromCookieHeader, tokenCanPush } from "@/lib/admin-access";
import { applyPlanGitHub, fetchPostRaw, friendlyGithubError, GithubError, listRedirectsGitHub, validBranch } from "@/lib/github-content";
import { planRedirect } from "@/lib/redirect-tools";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
const b64 = (s: string) => Buffer.from(s).toString("base64");

describe("tokenFromCookieHeader", () => {
  it("lấy token Keystatic từ header Cookie, bỏ qua cookie khác", () => {
    expect(tokenFromCookieHeader("a=1; keystatic-gh-access-token=abc123; b=2")).toBe("abc123");
    expect(tokenFromCookieHeader("keystatic-gh-access-token=a%20b")).toBe("a b");
  });
  it("không có / rỗng / hỏng thì null", () => {
    expect(tokenFromCookieHeader(null)).toBeNull();
    expect(tokenFromCookieHeader("a=1")).toBeNull();
    expect(tokenFromCookieHeader("keystatic-gh-access-token=")).toBeNull();
    expect(tokenFromCookieHeader("keystatic-gh-access-token=%E0%A4%A")).toBeNull();
  });
});

describe("quyền quản trị (isAdminCookieHeader)", () => {
  it("chế độ local trên máy: cho qua; trên Vercel: không", async () => {
    vi.stubEnv("NEXT_PUBLIC_KEYSTATIC_STORAGE", "local");
    vi.stubEnv("VERCEL", "");
    expect(await isAdminCookieHeader(null)).toBe(true);
    vi.stubEnv("VERCEL", "1");
    expect(await isAdminCookieHeader(null)).toBe(false);
  });

  it("chế độ GitHub: không cookie thì KHÔNG, không gọi GitHub", async () => {
    vi.stubEnv("NEXT_PUBLIC_KEYSTATIC_STORAGE", "github");
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    expect(await isAdminCookieHeader("a=1")).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("chế độ GitHub: chỉ token có quyền push mới qua; token không quyền / lỗi thì KHÔNG", async () => {
    vi.stubEnv("NEXT_PUBLIC_KEYSTATIC_STORAGE", "github");
    vi.stubGlobal("fetch", vi.fn(async () => json({ permissions: { push: true } })));
    expect(await isAdminCookieHeader("keystatic-gh-access-token=tot-1")).toBe(true);
    vi.stubGlobal("fetch", vi.fn(async () => json({ permissions: { push: false, pull: true } })));
    expect(await isAdminCookieHeader("keystatic-gh-access-token=chi-doc-2")).toBe(false);
    vi.stubGlobal("fetch", vi.fn(async () => json({ message: "Bad credentials" }, 401)));
    expect(await isAdminCookieHeader("keystatic-gh-access-token=het-han-3")).toBe(false);
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("mạng"))));
    expect(await isAdminCookieHeader("keystatic-gh-access-token=loi-mang-4")).toBe(false);
  });

  it("kết quả được nhớ (không gọi GitHub lại cho cùng token trong 60 giây) và gọi đúng repo với Bearer", async () => {
    const f = vi.fn(async () => json({ permissions: { push: true } }));
    vi.stubGlobal("fetch", f);
    expect(await tokenCanPush("tok-cache-5")).toBe(true);
    expect(await tokenCanPush("tok-cache-5")).toBe(true);
    expect(f).toHaveBeenCalledTimes(1);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.github.com/repos/aitosimple9-design/Web-Blog-Next.js-Keystatic-Vibe-Hosting");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok-cache-5");
  });
});

describe("validBranch", () => {
  it("nhận tên nhánh thường gặp, chặn ký tự lạ và ..", () => {
    for (const ok of ["main", "feat/redirect-tools", "content/sua-bai_1.2"]) expect(validBranch(ok), ok).toBe(true);
    for (const bad of ["", "a b", "../x", "a..b", "/x", "x/", "a?b=1", "a#b", "a%2F", 5, null]) expect(validBranch(bad), String(bad)).toBe(false);
  });
});

describe("ghi chuyển hướng lên GitHub", () => {
  it("đọc danh sách file ở nhánh (404 = rỗng)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/contents/content/redirects?")) return json([{ name: "a.json", type: "file", sha: "s1" }, { name: "ghi-chu.txt", type: "file", sha: "s2" }]);
        if (url.includes("/contents/content/redirects/a.json")) return new Response(JSON.stringify({ from: "/bai-viet/a", to: "/bai-viet/b" }));
        return json({}, 404);
      }),
    );
    expect(await listRedirectsGitHub("t", "nhanh-1")).toEqual([{ file: "a.json", data: { from: "/bai-viet/a", to: "/bai-viet/b" }, sha: "s1" }]);
    vi.stubGlobal("fetch", vi.fn(async () => json({ message: "Not Found" }, 404)));
    expect(await listRedirectsGitHub("t", "nhanh-1")).toEqual([]);
  });

  it("áp dụng kế hoạch: xóa file bị thay, sửa file cũ trỏ thẳng, rồi tạo file mới, đúng nhánh và sha", async () => {
    const calls: { method: string; url: string; body: Record<string, unknown> }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        calls.push({ method: String(init.method), url, body: JSON.parse(String(init.body)) });
        return json({ ok: true });
      }),
    );
    // đã có b → x (cùng đường dẫn cũ với chuyển hướng sắp tạo) nên bị xóa; a → b sẽ được trỏ thẳng về d
    const existing = [
      { file: "bai-viet-a.json", data: { from: "/bai-viet/a", to: "/bai-viet/b" }, sha: "sha-a" },
      { file: "cu-b.json", data: { from: "/bai-viet/b", to: "/bai-viet/x" }, sha: "sha-b" },
    ];
    const plan = planRedirect({ kind: "Bài viết", oldSlug: "b", newSlug: "d" }, existing);
    if (!plan.ok) throw new Error("kế hoạch hỏng");
    await applyPlanGitHub("tok", "nhanh-x", plan, existing);
    expect(calls.map((c) => `${c.method} ${c.url.split("/contents/")[1]}`)).toEqual(["DELETE content/redirects/cu-b.json", "PUT content/redirects/bai-viet-a.json", "PUT content/redirects/bai-viet-b.json"]);
    expect(calls[0].body).toMatchObject({ sha: "sha-b", branch: "nhanh-x" });
    // a → b trở thành a → d (b đang bị đổi thành d), nên có file cần cập nhật
    const plan2 = planRedirect({ kind: "Bài viết", oldSlug: "b", newSlug: "d" }, [{ file: "bai-viet-a.json", data: { from: "/bai-viet/a", to: "/bai-viet/b" }, sha: "sha-a" }]);
    if (!plan2.ok) throw new Error("kế hoạch hỏng");
    calls.length = 0;
    await applyPlanGitHub("tok", "nhanh-x", plan2, [{ file: "bai-viet-a.json", data: { from: "/bai-viet/a", to: "/bai-viet/b" }, sha: "sha-a" }]);
    expect(calls.map((c) => `${c.method} ${c.url.split("/contents/")[1]}`)).toEqual(["PUT content/redirects/bai-viet-a.json", "PUT content/redirects/bai-viet-b.json"]);
    expect(calls[0].body).toMatchObject({ branch: "nhanh-x", sha: "sha-a" });
    expect(JSON.parse(Buffer.from(String(calls[0].body.content), "base64").toString())).toMatchObject({ from: "/bai-viet/a", to: "/bai-viet/d" });
    expect(calls[1].body.sha).toBeUndefined();
  });

  it("GitHub từ chối (nhánh bảo vệ): ném lỗi, báo cách xử lý bằng tiếng Việt", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ message: "Repository rule violations found" }, 409)));
    const plan = planRedirect({ kind: "Khác", from: "/x", to: "/y" }, []);
    if (!plan.ok) throw new Error("kế hoạch hỏng");
    await expect(applyPlanGitHub("tok", "main", plan, [])).rejects.toBeInstanceOf(GithubError);
    const msg = friendlyGithubError(new GithubError(409, "Repository rule violations found"));
    expect(msg).toContain("New branch");
    expect(friendlyGithubError(new GithubError(401, "x"))).toContain("đăng nhập lại");
  });

  it("đọc nội dung thô của bài ở nhánh; slug / nhánh sai thì null không gọi GitHub", async () => {
    const f = vi.fn(async () => new Response("---\ntitle: X\n---\nnội dung"));
    vi.stubGlobal("fetch", f);
    expect(await fetchPostRaw("tok", "nhanh-1", "bai-a")).toContain("nội dung");
    expect(await fetchPostRaw("tok", "nhanh-1", "../x")).toBeNull();
    expect(await fetchPostRaw("tok", "a..b", "bai-a")).toBeNull();
    expect(f).toHaveBeenCalledTimes(1);
    vi.stubGlobal("fetch", vi.fn(async () => json({}, 404)));
    expect(await fetchPostRaw("tok", "nhanh-1", "bai-a")).toBeNull();
    void b64;
  });
});
