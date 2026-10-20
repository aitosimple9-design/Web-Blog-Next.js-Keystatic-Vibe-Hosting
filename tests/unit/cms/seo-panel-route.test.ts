import { describe, expect, it } from "vitest";
import { POST_ROUTE } from "@/cms/ui/SeoPanel";

// Hộp điểm SEO chỉ hiện ở form Bài viết. Chế độ GitHub có thêm /branch/<nhánh>/ trong địa chỉ: từng bị bỏ sót nên hộp không bao giờ hiện trên web thật.
describe("POST_ROUTE (địa chỉ form Bài viết của Keystatic)", () => {
  it.each([
    ["/keystatic/collection/posts/item/demo-01", null, "demo-01"],
    ["/keystatic/collection/posts/item/demo-01/", null, "demo-01"],
    ["/keystatic/branch/main/collection/posts/item/demo-01", "main", "demo-01"],
    ["/keystatic/branch/thu-github-mode/collection/posts/item/demo-04-on-lai", "thu-github-mode", "demo-04-on-lai"],
  ])("%s là form sửa bài", (path, branch, slug) => {
    const m = POST_ROUTE.exec(path)!;
    expect(m).not.toBeNull();
    expect(m[1] ?? null).toBe(branch);
    expect(m[2]).toBe(slug);
  });

  it.each(["/keystatic/collection/posts/create", "/keystatic/branch/main/collection/posts/create"])("%s là form tạo bài (không có slug)", (path) => {
    const m = POST_ROUTE.exec(path)!;
    expect(m).not.toBeNull();
    expect(m[2]).toBeUndefined();
  });

  it.each([
    "/keystatic/collection/posts",
    "/keystatic/branch/main/collection/posts",
    "/keystatic/collection/topics/item/chu-de-1",
    "/keystatic/branch/main/collection/topics/item/chu-de-1",
    "/keystatic/singleton/siteSettings",
    "/keystatic/branch/main/singleton/siteSettings",
    "/keystatic/collection/posts/item/a/b",
  ])("%s KHÔNG phải form bài", (path) => {
    expect(POST_ROUTE.test(path)).toBe(false);
  });
});
