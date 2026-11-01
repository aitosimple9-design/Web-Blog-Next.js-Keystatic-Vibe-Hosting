import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getAdminStats } from "@/shared/content/admin-stats";

const roots: string[] = [];
function setup(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "stats-"));
  roots.push(root);
  for (const [rel, text] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, text);
  }
  return root;
}
afterEach(() => {
  for (const r of roots.splice(0)) fs.rmSync(r, { recursive: true, force: true });
});

const post = (category: string, subs: string[]) => `---\ntitle: T\ncategory: ${category}\nsubtopics: [${subs.join(", ")}]\n---\nNội dung\n`;

describe("getAdminStats", () => {
  it("đếm số chủ đề con và số bài theo chủ đề / chủ đề con, kể cả bài nháp; bài nhiều chủ đề con được đếm ở từng chủ đề con", () => {
    const root = setup({
      "content/topics/cd-1.json": JSON.stringify({ name: "Chủ đề 1" }),
      "content/topics/cd-2.json": JSON.stringify({ name: "Chủ đề 2" }),
      "content/subtopics/a.json": JSON.stringify({ name: "Con A", topic: "cd-1" }),
      "content/subtopics/b.json": JSON.stringify({ name: "Con B", topic: "cd-1" }),
      "content/posts/p1.md": post("cd-1", ["a"]),
      "content/posts/p2.md": post("cd-1", ["a", "b"]).replace("---\nNội", "draft: true\n---\nNội"),
      "content/posts/p3.md": post("cd-2", []),
    });
    const s = getAdminStats(root);
    expect(s.topics["cd-1"]).toEqual({ name: "Chủ đề 1", subtopics: 2, posts: 2 });
    expect(s.topics["cd-2"]).toEqual({ name: "Chủ đề 2", subtopics: 0, posts: 1 });
    expect(s.subtopics.a).toEqual({ name: "Con A", topic: "cd-1", topicName: "Chủ đề 1", posts: 2 });
    expect(s.subtopics.b.posts).toBe(1);
    expect(s.posts.p2).toEqual({ topicName: "Chủ đề 1", subtopicNames: ["Con A", "Con B"] });
  });

  it("đếm số bài ghi đúng tên sách và số bìa ở Tủ sách Trang chủ trỏ tới từng chủ đề / sách", () => {
    const withBook = (book: string) => `---\ntitle: T\ncategory: cd-1\nsource:\n  book: "${book}"\n  author: A\n---\nNội dung\n`;
    const root = setup({
      "content/topics/cd-1.json": JSON.stringify({ name: "Chủ đề 1" }),
      "content/books/sach-a.json": JSON.stringify({ name: "Sách A" }),
      "content/books/sach-b.json": JSON.stringify({ name: "Sách B" }),
      "content/posts/p1.md": withBook("Sách A"),
      "content/posts/p2.md": withBook("Sách A"),
      "content/posts/p3.md": withBook("Sách không có"),
      "content/pages/trang-chu.json": JSON.stringify({ shelf: { books: [{ book: "sach-a", topic: "cd-1" }, { book: "sach-b", topic: "cd-1" }, null] } }),
    });
    const s = getAdminStats(root);
    expect(s.books).toEqual({ "sach-a": { name: "Sách A", posts: 2 }, "sach-b": { name: "Sách B", posts: 0 } });
    expect(s.shelf).toEqual({ topics: { "cd-1": 2 }, books: { "sach-a": 1, "sach-b": 1 } });
  });

  it("file hỏng hoặc thiếu thư mục thì bỏ qua, không ném lỗi", () => {
    const root = setup({ "content/topics/x.json": "{hỏng", "content/posts/p.md": "---\n: : :\n  - [\n---\n" });
    expect(() => getAdminStats(root)).not.toThrow();
    expect(getAdminStats(path.join(root, "khong-co")).topics).toEqual({});
  });
});
