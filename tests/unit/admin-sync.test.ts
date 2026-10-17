import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import keystaticConfig from "../../keystatic.config";
import { profile } from "@/config/profile";
import { PAGE_BLOCKS } from "@/config/blocks";
import { resolveBlocks } from "@/lib/pages";
import { articleDefaults, blogDefaults, bookDefaults, notFoundDefaults } from "@/config/page-texts";
import {
  IMAGE_RULES,
  MANAGED_IMAGE_DIRS,
  PROTECTED_IMAGES,
  SINGLETON_IMAGE_RULES,
  findOrphanImages,
  removeHomeReferences,
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
        `Thư mục ảnh "${d}" chưa có luật dọn ảnh: thêm vào IMAGE_RULES (ảnh theo slug) hoặc SINGLETON_IMAGE_RULES (ảnh singleton) trong src/lib/content-cleanup.ts`,
      ).toContain(d);
    }
  });

  it("mọi luật dọn ảnh đều trỏ tới một collection / singleton có thật (không để luật cũ)", () => {
    const collectionPaths = Object.values(collections).map((c) => c.path as string);
    for (const r of IMAGE_RULES) {
      expect(collectionPaths.some((p) => p.startsWith(r.contentDir)), `${r.contentDir} không còn là collection nào`).toBe(true);
    }
    const singletonPaths = Object.values(singletons).map((s) => s.path as string);
    for (const r of SINGLETON_IMAGE_RULES) {
      expect(singletonPaths.some((p) => p?.startsWith(`${r.contentDir}/`)), `${r.contentDir} không còn singleton nào`).toBe(true);
    }
  });

  it("singleton nằm ở một thư mục có luật dọn ảnh (content/settings hoặc content/pages)", () => {
    const dirs = SINGLETON_IMAGE_RULES.map((r) => `${r.contentDir}/`);
    for (const [key, s] of Object.entries(singletons)) {
      expect(
        dirs.some((d) => (s.path as string).startsWith(d)),
        `singleton "${key}" phải lưu ở ${dirs.join(" hoặc ")} (hoặc thêm thư mục mới vào SINGLETON_IMAGE_RULES)`,
      ).toBe(true);
    }
  });

  it("ảnh mặc định trong src/config/profile.ts nằm trong PROTECTED_IMAGES (không bị quét ảnh mồ côi xóa khi gỡ ảnh trong admin)", () => {
    expect(PROTECTED_IMAGES).toContain(profile.portrait.src);
    expect(PROTECTED_IMAGES).toContain(profile.storyImage.src);
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

  it("ảnh của Trang chủ: ảnh còn dùng thì giữ, ảnh đã thay thì là mồ côi", async () => {
    const root = make({
      "content/pages/trang-chu.json": '{"portrait":"/images/profile/moi.webp"}',
      "public/images/profile/moi.webp": "x",
      "public/images/profile/cu.webp": "x",
    });
    expect(findOrphanImages(root)).toEqual([{ path: "public/images/profile/cu.webp", kind: "file" }]);
    await removeOrphanImages(root);
    expect(fs.existsSync(path.join(root, "public/images/profile/moi.webp"))).toBe(true);
  });

  it("gỡ ảnh Trang chủ: ảnh MẶC ĐỊNH của mã vẫn được giữ", () => {
    const root = make({
      "content/pages/trang-chu.json": "{}",
      "public/images/profile/portrait-cutout.webp": "x",
      "public/images/profile/story.jpg": "x",
      "public/images/profile/khac.jpg": "x",
    });
    expect(findOrphanImages(root)).toEqual([{ path: "public/images/profile/khac.jpg", kind: "file" }]);
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

describe("xóa sách / chủ đề thì Trang chủ không giữ tham chiếu treo", () => {
  const setup = (shelf: object) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "home-"));
    fs.mkdirSync(path.join(root, "content", "pages"), { recursive: true });
    fs.writeFileSync(path.join(root, "content", "pages", "trang-chu.json"), JSON.stringify({ name: "A", shelf }));
    return root;
  };
  const read = (root: string) => JSON.parse(fs.readFileSync(path.join(root, "content", "pages", "trang-chu.json"), "utf8"));

  it("xóa sách → mục tủ sách trỏ tới sách đó bị gỡ, mục khác giữ nguyên", () => {
    const root = setup({ title: "T", books: [{ book: "sach-a", topic: "cd-1" }, { book: "sach-b", topic: null }] });
    expect(removeHomeReferences({ deletions: [{ path: "content/books/sach-a.json" }] }, root)).toBe(true);
    expect(read(root).shelf.books).toEqual([{ book: "sach-b", topic: null }]);
    expect(read(root).shelf.title).toBe("T");
  });

  it("xóa hết sách → danh sách rỗng (Trang chủ ẩn khối Tủ sách, không rơi về sách mẫu)", () => {
    const root = setup({ books: [{ book: "sach-a", topic: null }] });
    removeHomeReferences({ deletions: [{ path: "content/books/sach-a.json" }] }, root);
    expect(read(root).shelf.books).toEqual([]);
  });

  it("xóa chủ đề → bỏ liên kết chủ đề của mục, vẫn giữ sách", () => {
    const root = setup({ books: [{ book: "sach-a", topic: "cd-1" }, { book: "sach-b", topic: "cd-2" }] });
    removeHomeReferences({ deletions: [{ path: "content/topics/cd-1.json" }] }, root);
    expect(read(root).shelf.books).toEqual([{ book: "sach-a", topic: null }, { book: "sach-b", topic: "cd-2" }]);
  });

  it("không đụng file khi xóa mục không liên quan hoặc đường dẫn lạ", () => {
    const root = setup({ books: [{ book: "sach-a", topic: null }] });
    const before = fs.readFileSync(path.join(root, "content", "pages", "trang-chu.json"), "utf8");
    expect(removeHomeReferences({ deletions: [{ path: "content/posts/x.md" }, { path: "content/books/../x.json" }] }, root)).toBe(false);
    expect(fs.readFileSync(path.join(root, "content", "pages", "trang-chu.json"), "utf8")).toBe(before);
  });
});

// Nguyên tắc 2 (mọi chữ hiển thị trên web phải sửa được trong admin): mỗi khóa chữ mặc định của trang con phải có ô trong singleton tương ứng,
// và mỗi ô trong singleton phải có chữ mặc định (không để ô "chết" không nối vào đâu).
describe("chốt chặn: chữ của các trang con luôn có ô sửa trong admin", () => {
  type AnyField = { kind?: string; fields?: Record<string, AnyField> };
  const keysOfSchema = (schema: Record<string, AnyField>, prefix = ""): string[] =>
    Object.entries(schema).flatMap(([k, f]) =>
      f.kind === "object" && f.fields ? keysOfSchema(f.fields, `${prefix}${k}.`) : [`${prefix}${k}`],
    );
  const keysOfDefaults = (o: Record<string, unknown>, prefix = ""): string[] =>
    Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === "object" && !Array.isArray(v) ? keysOfDefaults(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
    );

  const pairs: [string, Record<string, unknown>][] = [
    ["bookPage", bookDefaults],
    ["blogPage", blogDefaults],
    ["articlePage", articleDefaults],
    ["notFoundPage", notFoundDefaults],
  ];
  for (const [singleton, defaults] of pairs) {
    it(`${singleton}: khóa chữ mặc định khớp đúng các ô trong admin`, () => {
      const schema = (singletons as Record<string, { schema: Record<string, AnyField> }>)[singleton].schema;
      expect(keysOfSchema(schema).filter((k) => !k.startsWith("blocks.") && k !== "ogImage").sort()).toEqual(keysOfDefaults(defaults).sort());
    });
  }
});

// Khối của trang (PR 5): danh mục ở src/config/blocks.ts phải khớp đúng các ô "blocks" trong admin, và hàm đọc luôn an toàn.
describe("chốt chặn: khối của trang khớp giữa danh mục, admin và hàm đọc", () => {
  type AnyField = { kind?: string; fields?: Record<string, AnyField> };
  for (const [page, cfg] of Object.entries(PAGE_BLOCKS)) {
    it(`${page}: mỗi khối trong danh mục có đúng một ô (${cfg.reorder ? "số vị trí" : "tích hiện"}) trong admin`, () => {
      const schema = (singletons as Record<string, { schema: Record<string, AnyField> }>)[page].schema;
      const blocks = schema.blocks.fields ?? {};
      expect(Object.keys(blocks).sort()).toEqual(cfg.blocks.map((b) => b.id).sort());
      for (const b of cfg.blocks) expect(blocks[b.id].kind).toBe("form");
    });
  }

  it("thiếu file / ô sai kiểu → mọi khối hiện, đúng thứ tự mặc định", () => {
    const ids = PAGE_BLOCKS.homePage.blocks.map((b) => b.id);
    for (const raw of [undefined, null, {}, { blocks: "x" }, { blocks: { story: "a", shelf: null } }]) {
      expect(resolveBlocks("homePage", raw)).toEqual(ids.map((id) => ({ id, enabled: true })));
    }
  });

  it("tắt khối và đổi vị trí theo admin; vị trí trùng thì giữ thứ tự mặc định; khối lạ bị bỏ qua", () => {
    const out = resolveBlocks("bookPage", {
      blocks: { newsletter: 1, latest: 0, marquee: 2, ghost: 1 },
    });
    expect(out).toEqual([
      { id: "newsletter", enabled: true },
      { id: "marquee", enabled: true },
      { id: "topics", enabled: true },
      { id: "latest", enabled: false },
    ]);
  });

  it("trang không cho đổi thứ tự: bỏ qua ô vị trí, vẫn bật / tắt được", () => {
    const out = resolveBlocks("articlePage", { blocks: { related: false, toc: 9 } });
    expect(out.map((b) => b.id)).toEqual(["toc", "source", "related", "newsletter"]);
    expect(out.find((b) => b.id === "related")?.enabled).toBe(false);
  });
});
