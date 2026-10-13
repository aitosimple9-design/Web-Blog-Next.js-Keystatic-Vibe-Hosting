import { describe, expect, it } from "vitest";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import { topics } from "@/config/topics";
import { getAllPosts } from "@/lib/posts";

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

  it("danh mục lấy từ src/config/topics.ts", () => {
    const category = keystaticConfig.collections!.posts.schema.category as unknown as {
      options: { value: string }[];
    };
    expect(category.options.map((o) => o.value)).toEqual(topics.map((t) => t.slug));
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
