import { afterEach, describe, expect, it, vi } from "vitest";
import { readBranchContent } from "@/cms/lib/github-content";
import { checkContent, memorySource } from "@/shared/content-check";

// Đọc cả nhánh cho /api/kiem-tra: cây file 1 lần gọi, chỉ tải chữ của content/**/*.md|json, nhớ theo mã băm giữa các lần gọi.
afterEach(() => vi.unstubAllGlobals());

const TREE = [
  { path: "content/topics/cd.json", type: "blob", sha: "s-topic" },
  { path: "content/posts/bai.md", type: "blob", sha: "s-post" },
  { path: "public/images/a.jpg", type: "blob", sha: "s-img" },
  { path: "content", type: "tree", sha: "s-dir" },
];
const BLOBS: Record<string, string> = { "s-topic": JSON.stringify({ name: "Chủ đề" }), "s-post": "---\ntitle: Bài\n---\nNội dung\n" };

function fakeGithub() {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      calls.push(url);
      if (url.includes("/git/trees/")) return new Response(JSON.stringify({ tree: TREE, truncated: false }));
      const sha = decodeURIComponent(url.slice(url.lastIndexOf("/") + 1));
      return sha in BLOBS ? new Response(BLOBS[sha]) : new Response("{}", { status: 404 });
    }),
  );
  return calls;
}

describe("readBranchContent", () => {
  it("lấy cây file + chữ của file content/, bỏ qua ảnh và thư mục", async () => {
    const calls = fakeGithub();
    const c = await readBranchContent("tok", "nhanh-a");
    expect([...c.paths].sort()).toEqual(["content/posts/bai.md", "content/topics/cd.json", "public/images/a.jpg"]);
    expect([...c.texts.keys()].sort()).toEqual(["content/posts/bai.md", "content/topics/cd.json"]);
    expect(calls.some((u) => u.includes("s-img"))).toBe(false);
    expect(calls[0]).toContain("/git/trees/nhanh-a?recursive=1");
  });

  it("lần gọi sau chỉ gọi lại cây file, chữ đã nhớ theo mã băm", async () => {
    fakeGithub();
    await readBranchContent("tok", "nhanh-a");
    const calls = fakeGithub();
    await readBranchContent("tok", "nhanh-a");
    expect(calls).toHaveLength(1);
  });

  it("kết quả dùng được làm nguồn cho bộ luật", async () => {
    fakeGithub();
    const c = await readBranchContent("tok", "nhanh-a");
    const r = checkContent(memorySource(c.paths, c.texts), { siteUrl: null, today: "2026-11-02" });
    expect(r.counts).toMatchObject({ posts: 1, topics: 1 });
    expect(r.errors).toContain('content/posts/bai.md: thiếu trường bắt buộc "description"');
  });
});
