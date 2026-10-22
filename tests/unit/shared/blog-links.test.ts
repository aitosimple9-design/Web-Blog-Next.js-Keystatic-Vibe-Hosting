import { describe, expect, it } from "vitest";
import { subtopicHref, topicHref } from "@/shared/blog-links";

describe("blog-links", () => {
  it("địa chỉ chủ đề và phân trang", () => {
    expect(topicHref("cd")).toBe("/blog/cd");
    expect(topicHref("cd", 1)).toBe("/blog/cd");
    expect(topicHref("cd", 3)).toBe("/blog/cd/trang/3");
  });
  it("địa chỉ chủ đề con và phân trang", () => {
    expect(subtopicHref("cd", "con")).toBe("/blog/cd/con");
    expect(subtopicHref("cd", "con", 1)).toBe("/blog/cd/con");
    expect(subtopicHref("cd", "con", 2)).toBe("/blog/cd/con/trang/2");
  });
});
