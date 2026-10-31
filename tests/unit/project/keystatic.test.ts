import { describe, expect, it } from "vitest";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../../keystatic.config";
import { getTopics } from "@/shared/content/topics";
import { getAllPosts } from "@/shared/content/posts";

// keystatic.config.ts phải khớp CLAUDE.md mục 5 và đọc được đúng các bài trong content/posts.
const reader = createReader(process.cwd(), keystaticConfig);

describe("keystatic.config.ts", () => {
  it("collection posts lưu ở content/posts/*", () => {
    expect(keystaticConfig.collections!.posts.path).toBe("content/posts/*");
  });

  it("có đủ các trường theo mục 5", () => {
    const keys = Object.keys(keystaticConfig.collections!.posts.schema);
    for (const k of ["slug", "title", "description", "category", "date", "source", "cover", "draft", "content"]) {
      expect(keys).toContain(k);
    }
  });

  it("ô Chủ đề của bài chọn từ collection topics (content/topics)", async () => {
    expect(keystaticConfig.collections!.topics.path).toBe("content/topics/*");
    const topicEntries = await reader.collections.topics.all();
    expect(topicEntries.map((e) => e.slug).sort()).toEqual(getTopics().map((t) => t.slug).sort());
  });

  it("collection books đọc được và tên sách khớp bìa trong bài", async () => {
    const books = await reader.collections.books.all();
    expect(books.length).toBeGreaterThan(0);
    // Bìa là tùy chọn (sách chưa có bìa dùng hình sinh tự động; check-content CẢNH BÁO). Có bìa thì phải là đường dẫn chữ.
    for (const b of books) {
      expect(b.entry.name.trim()).not.toBe("");
      if (b.entry.cover) expect(b.entry.cover).toMatch(/^\/images\/covers\//);
    }
  });

  it("Keystatic đọc được mọi bài và khớp với posts.ts", async () => {
    const entries = await reader.collections.posts.all();
    const published = entries.filter((e) => !e.entry.draft);
    expect(published.map((e) => e.slug).sort()).toEqual(
      getAllPosts()
        .map((p) => p.slug)
        .sort(),
    );
    for (const e of entries) {
      expect(e.entry.description.length).toBeLessThanOrEqual(160);
      expect(e.entry.source.book).not.toBe("");
    }
  });
});
