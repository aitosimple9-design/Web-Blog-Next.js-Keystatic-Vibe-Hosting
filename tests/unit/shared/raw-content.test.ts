import { describe, expect, it } from "vitest";
import { categoryOfRaw, getSeoResultFromRaw } from "@/shared/content/posts";
import { topicFromJson } from "@/shared/content/topics";

// Đọc nội dung THÔ lấy từ GitHub (xem trước / chấm SEO bản đã lưu ở nhánh), không qua file ở máy.
const POST = `---
title: "Bài thử"
description: "Mô tả thử."
category: chu-de-moi
date: 2026-10-01
source:
  book: "Sách"
  author: "Tác giả"
---

Nội dung thử.
`;

describe("categoryOfRaw", () => {
  it("lấy chủ đề từ frontmatter", () => expect(categoryOfRaw(POST)).toBe("chu-de-moi"));
  it("thiếu / rỗng / hỏng thì null", () => {
    expect(categoryOfRaw("---\ntitle: a\n---\nx")).toBeNull();
    expect(categoryOfRaw('---\ncategory: "  "\n---\nx')).toBeNull();
    expect(categoryOfRaw("---\n: : :\n  - [\n---")).toBeNull();
  });
});

describe("getSeoResultFromRaw", () => {
  it("chấm được bài từ nội dung thô", () => {
    const r = getSeoResultFromRaw("bai-thu", POST)!;
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.checks.length).toBeGreaterThan(0);
  });
});

describe("topicFromJson", () => {
  it("đọc tên, mô tả, ảnh, thứ tự", () => {
    expect(topicFromJson("chu-de-moi", JSON.stringify({ name: " Chủ đề mới ", description: "Mô tả", image: "/images/x.jpg", order: 3 }))).toEqual({
      slug: "chu-de-moi",
      name: "Chủ đề mới",
      description: "Mô tả",
      image: "/images/x.jpg",
      order: 3,
    });
  });
  it("thiếu tên hoặc JSON hỏng thì null", () => {
    expect(topicFromJson("a", JSON.stringify({ description: "x" }))).toBeNull();
    expect(topicFromJson("a", "{không phải json")).toBeNull();
  });
  it("thiếu order thì xếp cuối", () => {
    expect(topicFromJson("a", JSON.stringify({ name: "A" }))!.order).toBe(Number.MAX_SAFE_INTEGER);
  });
});
