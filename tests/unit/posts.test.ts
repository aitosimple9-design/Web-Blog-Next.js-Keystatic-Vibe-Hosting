import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { topics } from "@/config/topics";

// Nạp lại posts.ts với thư mục content giả (POSTS_DIR được tính từ process.cwd() lúc import).
async function loadWithContent(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "posts-"));
  fs.mkdirSync(path.join(root, "content", "posts"), { recursive: true });
  for (const [name, text] of Object.entries(files)) {
    fs.writeFileSync(path.join(root, "content", "posts", name), text);
  }
  vi.spyOn(process, "cwd").mockReturnValue(root);
  vi.resetModules();
  return import("@/lib/posts");
}

const cat = topics[0].slug;

function post(over: Record<string, string> = {}, body = "## Mục một\n\nNội dung.") {
  const fields: Record<string, string> = {
    title: '"Tiêu đề"',
    slug: "bai-a",
    description: '"Mô tả ngắn"',
    category: cat,
    date: "2026-10-05",
    ...over,
  };
  const head = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `---\n${head}\nsource:\n  book: "Sách"\n  author: "Tác giả"\n---\n${body}\n`;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("posts (nội dung thật trong content/posts)", () => {
  it("mọi bài hợp lệ, không bài nào là nháp, mới nhất trước", async () => {
    const { getAllPosts } = await import("@/lib/posts");
    const all = getAllPosts();
    expect(all.length).toBeGreaterThan(0);
    expect(all.every((p) => !p.draft)).toBe(true);
    const dates = all.map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("getPost trả HTML; slug lạ trả null", async () => {
    const { getAllPosts, getPost } = await import("@/lib/posts");
    const full = await getPost(getAllPosts()[0].slug);
    expect(full?.html).toContain("<");
    expect(await getPost("khong-ton-tai")).toBeNull();
  });

  it("bài liên quan không chứa chính bài đó và tôn trọng giới hạn", async () => {
    const { getAllPosts, getRelatedPosts } = await import("@/lib/posts");
    const p = getAllPosts()[0];
    const rel = getRelatedPosts(p, 4);
    expect(rel.length).toBeLessThanOrEqual(4);
    expect(rel.some((r) => r.slug === p.slug)).toBe(false);
  });

  it("countByTopic cộng lại bằng tổng số bài", async () => {
    const { countByTopic, getAllPosts } = await import("@/lib/posts");
    const sum = Object.values(countByTopic()).reduce((a, b) => a + b, 0);
    expect(sum).toBe(getAllPosts().length);
  });
});

describe("posts (kiểm tra dữ liệu bằng content giả)", () => {
  it("bỏ bài draft: true, giữ bài còn lại", async () => {
    const m = await loadWithContent({
      "bai-a.md": post(),
      "bai-b.md": post({ slug: "bai-b", draft: "true" }),
    });
    expect(m.getAllPosts().map((p) => p.slug)).toEqual(["bai-a"]);
    expect(await m.getPost("bai-b")).toBeNull();
  });

  it("render Markdown, tạo id cho h2 và bỏ HTML thô", async () => {
    const m = await loadWithContent({
      "bai-a.md": post({}, "## Ý chính\n\nChữ <script>alert(1)</script> thường."),
    });
    const full = await m.getPost("bai-a");
    // rehype-slug giữ dấu tiếng Việt trong id
    expect(full?.headings).toEqual([{ id: "ý-chính", text: "Ý chính" }]);
    expect(full?.html).not.toContain("<script");
  });

  it("slug không khớp tên file thì báo lỗi rõ ràng", async () => {
    const m = await loadWithContent({ "bai-a.md": post({ slug: "bai-khac" }) });
    expect(() => m.getAllPosts()).toThrow(/phải trùng tên file/);
  });

  it("description quá 160 ký tự thì báo lỗi", async () => {
    const m = await loadWithContent({
      "bai-a.md": post({ description: `"${"x".repeat(161)}"` }),
    });
    expect(() => m.getAllPosts()).toThrow(/tối đa 160/);
  });

  it("category chưa khai báo trong topics.ts thì báo lỗi", async () => {
    const m = await loadWithContent({ "bai-a.md": post({ category: "chu-de-khong-co" }) });
    expect(() => m.getAllPosts()).toThrow(/chưa có trong src\/config\/topics\.ts/);
  });

  it("date sai định dạng thì báo lỗi", async () => {
    const m = await loadWithContent({ "bai-a.md": post({ date: '"05/10/2026"' }) });
    expect(() => m.getAllPosts()).toThrow(/YYYY-MM-DD/);
  });

  it("thiếu trường bắt buộc (title) thì báo lỗi", async () => {
    const m = await loadWithContent({ "bai-a.md": post().replace(/title: .*\n/, "") });
    expect(() => m.getAllPosts()).toThrow(/"title"/);
  });
});
