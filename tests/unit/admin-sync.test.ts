import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import keystaticConfig from "../../keystatic.config";
import {
  IMAGE_RULES,
  MANAGED_IMAGE_DIRS,
  SINGLETON_IMAGE_RULE,
  findOrphanImages,
  removeOrphanImages,
} from "@/lib/content-cleanup";

// NGUYÊN TẮC (Lộc, 2026-10-16): thêm / xóa gì trong trang quản trị thì file đi kèm phải đồng bộ theo.
// Nhóm "chốt chặn" bên dưới đọc keystatic.config.ts và FAIL khi ai đó thêm nội dung / ô ảnh mới mà quên đồng bộ.

const configSource = fs.readFileSync(path.join(process.cwd(), "keystatic.config.ts"), "utf8");
const collections = keystaticConfig.collections ?? {};
const singletons = keystaticConfig.singletons ?? {};

describe("chốt chặn: trang quản trị luôn đồng bộ với file", () => {
  it("mọi collection và singleton đều có mặt trong menu trái của Keystatic (thêm là thấy ngay)", () => {
    const nav = (keystaticConfig.ui as { navigation?: Record<string, string[]> } | undefined)?.navigation ?? {};
    const inMenu = new Set(Object.values(nav).flat());
    const all = [...Object.keys(collections), ...Object.keys(singletons)];
    for (const key of all) expect(inMenu.has(key), `"${key}" chưa có trong ui.navigation của keystatic.config.ts`).toBe(true);
    for (const key of inMenu) expect(all, `menu nhắc tới "${key}" nhưng không có trong config`).toContain(key);
  });

  it("mọi thư mục ảnh (`directory:`) trong keystatic.config.ts đều có luật dọn ảnh ở src/lib/content-cleanup.ts", () => {
    const dirs = new Set([...configSource.matchAll(/directory:\s*"([^"]+)"/g)].map((m) => m[1]));
    expect(dirs.size).toBeGreaterThan(0);
    for (const d of dirs) {
      expect(
        MANAGED_IMAGE_DIRS,
        `Thư mục ảnh "${d}" chưa có luật dọn ảnh: thêm vào IMAGE_RULES (ảnh theo slug) hoặc SINGLETON_IMAGE_RULE (ảnh singleton) trong src/lib/content-cleanup.ts`,
      ).toContain(d);
    }
  });

  it("mọi luật dọn ảnh đều trỏ tới một collection / singleton có thật (không để luật cũ)", () => {
    const collectionPaths = Object.values(collections).map((c) => c.path as string);
    for (const r of IMAGE_RULES) {
      expect(collectionPaths.some((p) => p.startsWith(r.contentDir)), `${r.contentDir} không còn là collection nào`).toBe(true);
    }
    const singletonPaths = Object.values(singletons).map((s) => s.path as string);
    expect(singletonPaths.some((p) => p?.startsWith(SINGLETON_IMAGE_RULE.contentDir))).toBe(true);
  });

  it("singleton nằm trong content/settings (một nơi duy nhất để dọn ảnh và để tìm cài đặt)", () => {
    for (const [key, s] of Object.entries(singletons)) {
      expect((s.path as string).startsWith("content/settings/"), `singleton "${key}" phải lưu ở content/settings/`).toBe(true);
    }
  });

  it("script prune-images và check-content dùng chung luật ở content-cleanup.ts (không viết lại bản thứ hai)", () => {
    for (const f of ["scripts/prune-orphan-images.mjs", "scripts/check-content.mjs"]) {
      const src = fs.readFileSync(path.join(process.cwd(), f), "utf8");
      expect(src, `${f} phải đọc luật từ src/lib/content-cleanup.ts`).toContain("content-cleanup.ts");
      expect(src, `${f} không được tự khai báo lại luật ảnh`).not.toMatch(/imageDir:\s*"public\/images/);
    }
  });
});

describe("findOrphanImages / removeOrphanImages", () => {
  const make = (files: Record<string, string>) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "orphans-"));
    for (const [rel, text] of Object.entries(files)) {
      const abs = path.join(root, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, text);
    }
    return root;
  };

  it("không có gì mồ côi khi mọi ảnh đều được nhắc tới", () => {
    const root = make({
      "content/posts/bai-a.md": "---\ncover: /images/posts/bai-a/cover.jpg\n---\n![x](/images/posts/bai-a/y.jpg)",
      "public/images/posts/bai-a/cover.jpg": "x",
      "public/images/posts/bai-a/y.jpg": "x",
      "content/settings/site.json": '{"ogImage":"/images/site/ogImage.png"}',
      "content/settings/header.json": '{"logoImage":"/images/site/logoImage.png"}',
      "public/images/site/ogImage.png": "x",
      "public/images/site/logoImage.png": "x",
    });
    expect(findOrphanImages(root)).toEqual([]);
  });

  it("xóa bài thì cả thư mục ảnh là mồ côi", () => {
    const root = make({ "public/images/posts/bai-a/cover.jpg": "x" });
    expect(findOrphanImages(root)).toEqual([{ path: "public/images/posts/bai-a", kind: "folder" }]);
  });

  it("thay / gỡ ảnh trong bài thì file ảnh cũ là mồ côi, ảnh còn dùng thì giữ", async () => {
    const root = make({
      "content/posts/bai-a.md": "cover: /images/posts/bai-a/moi.jpg",
      "public/images/posts/bai-a/moi.jpg": "x",
      "public/images/posts/bai-a/cu.jpg": "x",
    });
    expect(findOrphanImages(root)).toEqual([{ path: "public/images/posts/bai-a/cu.jpg", kind: "file" }]);
    await removeOrphanImages(root);
    expect(fs.existsSync(path.join(root, "public/images/posts/bai-a/cu.jpg"))).toBe(false);
    expect(fs.existsSync(path.join(root, "public/images/posts/bai-a/moi.jpg"))).toBe(true);
  });

  it("gỡ logo / ảnh chia sẻ ở Cài đặt thì file trong public/images/site là mồ côi", async () => {
    const root = make({
      "content/settings/header.json": '{"menu":[]}',
      "public/images/site/logoImage.png": "x",
      "content/settings/site.json": '{"ogImage":"/images/site/ogImage.jpg"}',
      "public/images/site/ogImage.jpg": "x",
    });
    expect(findOrphanImages(root)).toEqual([{ path: "public/images/site/logoImage.png", kind: "file" }]);
    await removeOrphanImages(root);
    expect(fs.existsSync(path.join(root, "public/images/site/ogImage.jpg"))).toBe(true);
  });

  it("tên file có dấu cách / dấu tiếng Việt trong URL đã mã hóa vẫn được nhận ra", () => {
    const root = make({
      "content/posts/bai-a.md": `![x](${encodeURI("/images/posts/bai-a/ảnh đẹp.jpg")})`,
      "public/images/posts/bai-a/ảnh đẹp.jpg": "x",
    });
    expect(findOrphanImages(root)).toEqual([]);
  });
});
