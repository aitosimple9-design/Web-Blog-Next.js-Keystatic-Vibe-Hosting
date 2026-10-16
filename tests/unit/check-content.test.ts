import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Chạy scripts/check-content.mjs trên một thư mục nội dung giả (--root).
function run(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "check-"));
  for (const [rel, text] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, text);
  }
  const r = spawnSync(process.execPath, [path.join(process.cwd(), "scripts", "check-content.mjs"), "--root", root], {
    encoding: "utf8",
  });
  return { code: r.status, out: r.stdout };
}

const topic = { "content/topics/chu-de-1.json": JSON.stringify({ name: "Chủ đề 1", description: "Mô tả", image: "/images/t.jpg" }), "public/images/t.jpg": "x" };
const post = (extra = "") =>
  `---\ntitle: Bài A\ndescription: "Mô tả đủ dài để qua ngưỡng cảnh báo năm mươi ký tự cho SEO nhé"\ncategory: chu-de-1\ndate: 2026-10-05\nsource:\n  book: "Sách X"\n  author: "Tác giả"\n${extra}---\nNội dung.\n`;

describe("scripts/check-content.mjs", () => {
  it("nội dung đúng thì đạt (mã 0)", () => {
    const r = run({ ...topic, "content/posts/bai-a.md": post() });
    expect(r.code).toBe(0);
    expect(r.out).toContain("không có lỗi");
  });

  it("bắt chủ đề không tồn tại, ảnh bìa mất, bài liên quan sai (mã 1)", () => {
    const r = run({
      ...topic,
      "content/posts/bai-a.md": post("cover: /images/posts/bai-a/khong-co.jpg\nrelated: [bai-ma]\n").replace("chu-de-1", "chu-de-9"),
    });
    expect(r.code).toBe(1);
    expect(r.out).toContain('chủ đề "chu-de-9"');
    expect(r.out).toContain("file ảnh cover không tồn tại");
    expect(r.out).toContain('bài liên quan "bai-ma" không tồn tại');
  });

  it("bắt mô tả quá 160 ký tự và thiếu tác giả", () => {
    const r = run({
      ...topic,
      "content/posts/bai-a.md": post().replace(/description: ".*"/, `description: "${"x".repeat(161)}"`).replace('  author: "Tác giả"\n', ""),
    });
    expect(r.code).toBe(1);
    expect(r.out).toContain("tối đa 160");
    expect(r.out).toContain("source.author");
  });

  it("cảnh báo (không lỗi): sách chưa có trong mục Sách, thư mục ảnh mồ côi", () => {
    const r = run({ ...topic, "content/posts/bai-a.md": post(), "public/images/posts/bai-ma/cover.jpg": "x" });
    expect(r.code).toBe(0);
    expect(r.out).toContain("chưa có trong mục Sách");
    expect(r.out).toContain("thư mục ảnh mồ côi");
  });

  it("báo thông tin bài lên lịch", () => {
    const r = run({ ...topic, "content/posts/bai-a.md": post().replace("2026-10-05", "2099-01-01") });
    expect(r.code).toBe(0);
    expect(r.out).toContain("LÊN LỊCH");
  });

  it("cảnh báo ảnh trong bài dùng chung file với ảnh bìa (Keystatic ghi đè hai ảnh cùng tên)", () => {
    const r = run({
      ...topic,
      "content/posts/bai-a.md": post("cover: /images/posts/bai-a/cover.jpg\n").replace("Nội dung.", "![Mô tả](/images/posts/bai-a/cover.jpg)"),
      "public/images/posts/bai-a/cover.jpg": "x",
    });
    expect(r.code).toBe(0); // chỉ cảnh báo, không làm CI đỏ
    expect(r.out).toContain("dùng chung file với ảnh bìa");
  });

  it("ảnh trong bài khác tên với ảnh bìa thì không cảnh báo, ảnh trong bài mất file thì lỗi", () => {
    const ok = run({
      ...topic,
      "content/posts/bai-a.md": post("cover: /images/posts/bai-a/cover.jpg\n").replace("Nội dung.", "![Mô tả](/images/posts/bai-a/anh-trong-bai.jpg)"),
      "public/images/posts/bai-a/cover.jpg": "x",
      "public/images/posts/bai-a/anh-trong-bai.jpg": "y",
    });
    expect(ok.out).not.toContain("dùng chung file");
    const missing = run({ ...topic, "content/posts/bai-a.md": post().replace("Nội dung.", "![Mô tả](/images/posts/bai-a/mat.jpg)") });
    expect(missing.code).toBe(1);
    expect(missing.out).toContain("ảnh trong nội dung không tồn tại");
  });

  it("chấm SEO: cảnh báo mục chưa đạt kèm điểm, không làm CI đỏ, có điểm trung bình ở mục thông tin", () => {
    const r = run({ ...topic, "content/posts/bai-a.md": post() });
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/SEO \d+\/100, chưa đạt:.*Độ dài bài/);
    expect(r.out).toMatch(/Điểm SEO trung bình \d+\/100 \(1 bài\)/);
  });
});
