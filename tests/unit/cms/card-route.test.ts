import { describe, expect, it } from "vitest";
import { CARD_ROUTE } from "@/cms/ui/KeystaticSettingsCards";

// Trang nào của Keystatic được vẽ dạng thẻ: cài đặt (singleton) và form Chủ đề / Sách / Chuyển hướng, cả ở chế độ GitHub (có /branch/<nhánh>/).
describe("CARD_ROUTE", () => {
  it.each([
    "/keystatic/singleton/siteSettings",
    "/keystatic/branch/main/singleton/siteSettings",
    "/keystatic/collection/topics/item/chu-de-1",
    "/keystatic/collection/topics/create",
    "/keystatic/collection/subtopics/create",
    "/keystatic/branch/thu/collection/books/item/sach-1",
    "/keystatic/branch/thu/collection/redirects/create",
  ])("%s dạng thẻ", (path) => expect(CARD_ROUTE.test(path)).toBe(true));

  it.each([
    "/keystatic",
    "/keystatic/collection/posts",
    "/keystatic/collection/posts/item/demo-01",
    "/keystatic/collection/posts/create",
    "/keystatic/branch/main/collection/posts/item/demo-01",
    "/keystatic/collection/topics",
    "/keystatic/collection/redirects",
    "/keystatic/branch/main/collection/books",
  ])("%s KHÔNG dạng thẻ (danh sách hoặc form bài)", (path) => expect(CARD_ROUTE.test(path)).toBe(false));
});
