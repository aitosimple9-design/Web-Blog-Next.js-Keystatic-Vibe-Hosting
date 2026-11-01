import { describe, expect, it } from "vitest";
import { checkContent, type BaseSource, type CheckSource } from "@/shared/content-check";

// Bộ luật chạy trên nguồn TRONG BỘ NHỚ (như trang quản trị đọc nhánh từ GitHub), không đụng ổ đĩa.
// Hành vi chi tiết của từng luật đã có tests/unit/project/check-content.test.ts (chạy qua script).
function memory(files: Record<string, string>): CheckSource {
  return {
    list: (dir, ext) =>
      Object.keys(files)
        .filter((p) => p.startsWith(`${dir}/`) && !p.slice(dir.length + 1).includes("/") && p.endsWith(ext))
        .map((p) => p.slice(dir.length + 1)),
    read: (rel) => files[rel] ?? null,
    exists: (rel) => rel in files,
  };
}
const asBase = (label: string, files: Record<string, string>): BaseSource => ({ label, ...memory(files) });

const topic = { "content/topics/cd.json": JSON.stringify({ name: "Chủ đề", description: "Mô tả", image: "/images/t.jpg" }), "public/images/t.jpg": "x" };
const sub = { "content/subtopics/con.json": JSON.stringify({ name: "Con", topic: "cd", description: "Mô tả" }) };
const post = (category = "cd") =>
  `---\ntitle: Bài A\ndescription: "Mô tả đủ dài để qua ngưỡng cảnh báo năm mươi ký tự cho SEO nhé"\ncategory: ${category}\nsubtopics:\n  - con\ndate: 2026-10-05\nsource:\n  book: "Sách"\n  author: "Tác giả"\n---\nNội dung.\n`;
const opts = { siteUrl: null, today: "2026-11-02" };

describe("checkContent (nguồn trong bộ nhớ)", () => {
  it("nội dung đúng: không lỗi, đếm đúng số mục", () => {
    const r = checkContent(memory({ ...topic, ...sub, "content/posts/bai-a.md": post() }), opts);
    expect(r.errors).toEqual([]);
    expect(r.counts).toEqual({ posts: 1, topics: 1, subtopics: 1, books: 0 });
  });

  it("bài trỏ chủ đề không có, ảnh không có file: LỖI ghi đúng file", () => {
    const r = checkContent(memory({ ...topic, ...sub, "content/posts/bai-a.md": post("khong-co").replace("source:", "cover: /images/mat.jpg\nsource:") }), opts);
    expect(r.errors.some((e) => e.startsWith("content/posts/bai-a.md: chủ đề \"khong-co\""))).toBe(true);
    expect(r.errors).toContain("content/posts/bai-a.md: file ảnh cover không tồn tại: /images/mat.jpg");
  });

  it("so với bản gốc: chủ đề bị xóa mà thiếu chuyển hướng là LỖI; có chuyển hướng thì hết", () => {
    const base = asBase("main", { ...topic, "content/topics/cu.json": JSON.stringify({ name: "Cũ" }) });
    const now = { ...topic, ...sub, "content/posts/bai-a.md": post() };
    expect(checkContent(memory(now), { ...opts, base }).errors.some((e) => e.includes("link cũ /blog/cu"))).toBe(true);
    const withRedirect = { ...now, "content/redirects/cu.json": JSON.stringify({ from: "/blog/cu", to: "/blog", permanent: true }) };
    expect(checkContent(memory(withRedirect), { ...opts, base }).errors).toEqual([]);
  });

  it("ảnh mồ côi và địa chỉ web do nơi gọi truyền vào", () => {
    const r = checkContent(memory({ ...topic, ...sub, "content/posts/bai-a.md": post() }), {
      today: "2026-11-02",
      orphanImages: [{ path: "public/images/posts/cu", kind: "folder" }],
      siteUrl: { level: "error", url: "", message: "sai" },
    });
    expect(r.warnings.some((w) => w.startsWith("public/images/posts/cu: thư mục ảnh mồ côi"))).toBe(true);
    expect(r.errors).toContain("NEXT_PUBLIC_SITE_URL: sai");
  });
});
