import { describe, expect, it } from "vitest";
import { topicBySlug, topics } from "@/config/topics";

describe("topics", () => {
  it("slug duy nhất, chữ thường không dấu nối bằng '-'", () => {
    const slugs = topics.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("mỗi chủ đề có tên, mô tả và ảnh", () => {
    for (const t of topics) {
      expect(t.name).not.toBe("");
      expect(t.description).not.toBe("");
      expect(t.image.startsWith("/")).toBe(true);
    }
  });

  it("topicBySlug tìm đúng và trả về rỗng khi không có", () => {
    expect(topicBySlug(topics[0].slug)?.slug).toBe(topics[0].slug);
    expect(topicBySlug("khong-ton-tai")).toBeFalsy();
  });
});
