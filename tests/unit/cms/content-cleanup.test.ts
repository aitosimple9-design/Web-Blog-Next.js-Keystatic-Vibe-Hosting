import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { imageFoldersToRemove, removeImageFolders } from "@/cms/lib/content-cleanup";

describe("content-cleanup: xóa nội dung thì xóa luôn thư mục ảnh", () => {
  it("xóa bài / chủ đề / sách → thư mục ảnh cùng slug", () => {
    expect(
      imageFoldersToRemove({
        deletions: [
          { path: "content/posts/bai-a.md" },
          { path: "content/topics/chu-de-1.json" },
          { path: "content/books/sach-mau-1.json" },
        ],
      }),
    ).toEqual(["public/images/posts/bai-a", "public/images/topics/chu-de-1", "public/images/covers/sach-mau-1"]);
  });

  it("đổi slug (đang ghi ảnh vào thư mục cũ) thì không xóa thư mục đó", () => {
    expect(
      imageFoldersToRemove({
        additions: [{ path: "public/images/posts/bai-a/cover.jpg" }],
        deletions: [{ path: "content/posts/bai-a.md" }],
      }),
    ).toEqual([]);
  });

  it("bỏ qua đường dẫn lạ và slug không hợp lệ", () => {
    expect(
      imageFoldersToRemove({
        deletions: [
          { path: "content/settings/site.json" },
          { path: "content/posts/../../x.md" },
          { path: "content/posts/Bai A.md" },
          { path: "src/shared/content/posts.ts" },
        ],
      }),
    ).toEqual([]);
  });

  it("chỉ xóa bên trong public/images", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "cleanup-"));
    fs.mkdirSync(path.join(root, "public", "images", "posts", "bai-a"), { recursive: true });
    fs.writeFileSync(path.join(root, "public", "images", "posts", "bai-a", "cover.jpg"), "x");
    fs.mkdirSync(path.join(root, "content"), { recursive: true });
    await removeImageFolders(["public/images/posts/bai-a", "content"], root);
    expect(fs.existsSync(path.join(root, "public", "images", "posts", "bai-a"))).toBe(false);
    expect(fs.existsSync(path.join(root, "content"))).toBe(true);
  });
});
