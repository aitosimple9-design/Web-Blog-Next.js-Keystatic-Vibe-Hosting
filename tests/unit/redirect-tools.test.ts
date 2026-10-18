import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRedirect, listExisting, listItems } from "@/lib/redirect-tools";
import { readRedirectFiles } from "@/lib/redirects";

const mk = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rtools-"));
  fs.mkdirSync(path.join(root, "content", "posts"), { recursive: true });
  fs.mkdirSync(path.join(root, "content", "topics"), { recursive: true });
  fs.writeFileSync(path.join(root, "content", "posts", "bai-a.md"), '---\ntitle: "Bài A"\n---\nx');
  fs.writeFileSync(path.join(root, "content", "topics", "chu-de-1.json"), JSON.stringify({ name: "Chủ đề một" }));
  return root;
};

describe("redirect-tools", () => {
  it("liệt kê bài / chủ đề với tiêu đề; sách và khác không có danh sách", () => {
    const root = mk();
    expect(listItems("Bài viết", root)).toEqual([{ slug: "bai-a", title: "Bài A" }]);
    expect(listItems("Chủ đề", root)).toEqual([{ slug: "chu-de-1", title: "Chủ đề một" }]);
    expect(listItems("Sách", root)).toEqual([]);
  });

  it("tạo chuyển hướng bài viết đúng định dạng admin", () => {
    const root = mk();
    const r = createRedirect({ kind: "Bài viết", oldSlug: "bai-a", newSlug: "bai-b" }, root);
    expect(r).toMatchObject({ ok: true, from: "/bai-viet/bai-a", to: "/bai-viet/bai-b" });
    const saved = JSON.parse(fs.readFileSync(path.join(root, "content/redirects/bai-viet-bai-a.json"), "utf8"));
    expect(saved).toMatchObject({ kind: "Bài viết", from: "/bai-viet/bai-a", to: "/bai-viet/bai-b", permanent: true });
  });

  it("đổi slug lần hai: chuyển hướng cũ được trỏ thẳng về đích mới (không thành chuỗi)", () => {
    const root = mk();
    createRedirect({ kind: "Bài viết", oldSlug: "a", newSlug: "b" }, root);
    const r = createRedirect({ kind: "Bài viết", oldSlug: "b", newSlug: "c" }, root);
    expect(r.ok && r.flattened).toHaveLength(1);
    const all = readRedirectFiles(root).map((e) => `${e.from}>${e.to}`).sort();
    expect(all).toEqual(["/bai-viet/a>/bai-viet/c", "/bai-viet/b>/bai-viet/c"]);
  });

  it("đổi trả lại slug cũ: xóa chuyển hướng ngược, không vòng lặp", () => {
    const root = mk();
    createRedirect({ kind: "Bài viết", oldSlug: "a", newSlug: "b" }, root);
    const r = createRedirect({ kind: "Bài viết", oldSlug: "b", newSlug: "a" }, root);
    expect(r.ok && r.removed).toHaveLength(1);
    expect(readRedirectFiles(root).map((e) => `${e.from}>${e.to}`)).toEqual(["/bai-viet/b>/bai-viet/a"]);
  });

  it("từ chối slug sai và đường dẫn sai", () => {
    const root = mk();
    expect(createRedirect({ kind: "Bài viết", oldSlug: "a", newSlug: "Bài Mới" }, root).ok).toBe(false);
    expect(createRedirect({ kind: "Bài viết", oldSlug: "a", newSlug: "a" }, root).ok).toBe(false);
    expect(createRedirect({ kind: "Khác", from: "/keystatic", to: "/blog" }, root).ok).toBe(false);
    expect(createRedirect({ kind: "Sai", from: "/x", to: "/y" }, root).ok).toBe(false);
    expect(createRedirect({ kind: "Khác", from: "/x", to: "/y" }, root).ok).toBe(true);
  });

  it("sửa chuyển hướng có sẵn: cùng đường dẫn cũ thì thay mục cũ (không trùng), đọc lại được qua listExisting", () => {
    const root = mk();
    createRedirect({ kind: "Bài viết", oldSlug: "a", newSlug: "b" }, root);
    fs.writeFileSync(path.join(root, "content/redirects/tay.json"), JSON.stringify({ label: "tay", from: "/bai-viet/a", to: "/blog" }));
    const r = createRedirect({ kind: "Bài viết", from: "/bai-viet/a", to: "/bai-viet/c" }, root);
    expect(r.ok).toBe(true);
    expect(listExisting(root)).toEqual([{ file: "bai-viet-a.json", kind: "Bài viết", from: "/bai-viet/a", to: "/bai-viet/c" }]);
  });
});
