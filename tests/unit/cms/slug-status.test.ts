import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRedirect, slugStatus } from "@/cms/lib/redirect-tools";

const mk = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "slugst-"));
  const put = (rel: string, text: string) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  const post = (extra: string) => `---\ntitle: X\ndate: 2020-01-01\n${extra}---\nx`;
  put("content/posts/bai-da-dang.md", post(""));
  put("content/posts/bai-nhap.md", post("draft: true\n"));
  put("content/posts/bai-review.md", post("status: review\n"));
  put("content/posts/bai-tuong-lai.md", post("").replace("2020-01-01", "2999-01-01"));
  put("content/posts/demo-bai-mau.md", post(""));
  put("content/topics/chu-de-1.json", JSON.stringify({ name: "Chủ đề 1" }));
  return root;
};

describe("slugStatus: khi nào đổi slug PHẢI có chuyển hướng", () => {
  it("bài đã đăng và chủ đề đang có: cần chuyển hướng", () => {
    const root = mk();
    expect(slugStatus("Bài viết", "bai-da-dang", root)).toEqual({ live: true, hasRedirect: false, needsRedirect: true });
    expect(slugStatus("Chủ đề", "chu-de-1", root).needsRedirect).toBe(true);
  });
  it("bài nháp / duyệt / lên lịch / bài mẫu demo-*: được miễn", () => {
    const root = mk();
    for (const s of ["bai-nhap", "bai-review", "bai-tuong-lai", "demo-bai-mau"]) expect(slugStatus("Bài viết", s, root).needsRedirect, s).toBe(false);
  });
  it("đã có chuyển hướng từ đường dẫn cũ: không cần nữa", () => {
    const root = mk();
    createRedirect({ kind: "Bài viết", oldSlug: "bai-da-dang", newSlug: "bai-moi" }, root);
    expect(slugStatus("Bài viết", "bai-da-dang", root)).toEqual({ live: true, hasRedirect: true, needsRedirect: false });
  });
  it("loại không có trang riêng hoặc slug sai: không bắt", () => {
    const root = mk();
    expect(slugStatus("Sách", "x", root).needsRedirect).toBe(false);
    expect(slugStatus("Bài viết", "../etc", root).needsRedirect).toBe(false);
  });
});
