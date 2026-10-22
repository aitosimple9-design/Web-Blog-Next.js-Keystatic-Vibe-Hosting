import { describe, expect, it } from "vitest";
import { getSubtopics, getSubtopicsByTopic, RESERVED_SUBTOPIC_SLUGS, subtopicBySlug, subtopicFromJson } from "@/shared/content/subtopics";
import { getTopics } from "@/shared/content/topics";

describe("subtopicFromJson", () => {
  it("đọc đủ trường, cắt khoảng trắng", () => {
    const s = subtopicFromJson("cd-con", JSON.stringify({ name: " Tên ", topic: "cd", order: 2, description: " Mô tả ", image: "/a.jpg" }));
    expect(s).toEqual({ slug: "cd-con", name: "Tên", topic: "cd", order: 2, description: "Mô tả", image: "/a.jpg" });
  });
  it("thiếu tên hoặc chủ đề lớn, hoặc JSON hỏng thì null", () => {
    expect(subtopicFromJson("a", JSON.stringify({ topic: "cd" }))).toBeNull();
    expect(subtopicFromJson("a", JSON.stringify({ name: "A" }))).toBeNull();
    expect(subtopicFromJson("a", "{hỏng")).toBeNull();
  });
  it("thiếu thứ tự thì xếp cuối", () => {
    expect(subtopicFromJson("a", JSON.stringify({ name: "A", topic: "cd" }))!.order).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe("chủ đề con trong content/subtopics", () => {
  it("mỗi chủ đề con thuộc một chủ đề có thật, slug không phạm slug dành riêng", () => {
    const topics = new Set(getTopics().map((t) => t.slug));
    const all = getSubtopics();
    expect(all.length).toBeGreaterThan(0);
    for (const s of all) {
      expect(topics.has(s.topic), `${s.slug} trỏ tới chủ đề không có`).toBe(true);
      expect(RESERVED_SUBTOPIC_SLUGS).not.toContain(s.slug);
    }
  });
  it("getSubtopicsByTopic và subtopicBySlug khớp nhau", () => {
    const first = getSubtopics()[0];
    expect(subtopicBySlug(first.slug)).toEqual(first);
    expect(getSubtopicsByTopic(first.topic).map((s) => s.slug)).toContain(first.slug);
    expect(subtopicBySlug("khong-co")).toBeUndefined();
  });
});
