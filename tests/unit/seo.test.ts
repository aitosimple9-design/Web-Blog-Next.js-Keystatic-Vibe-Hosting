import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { getAllPosts } from "@/lib/posts";

describe("SEO", () => {
  it("robots trỏ tới sitemap.xml", () => {
    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/);
  });

  it("sitemap có /book và mọi bài đã đăng", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/book"))).toBe(true);
    for (const p of getAllPosts()) {
      expect(urls.some((u) => u.endsWith(`/bai-viet/${p.slug}`))).toBe(true);
    }
  });

  it("sitemap không có URL trùng", () => {
    const urls = sitemap().map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
