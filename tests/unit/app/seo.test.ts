import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { getAllPosts } from "@/shared/content/posts";

describe("SEO", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("robots (production) trỏ tới sitemap.xml", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/);
  });

  it("robots (không phải production) chặn toàn bộ và không công bố sitemap", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const r = robots();
    expect(r.sitemap).toBeUndefined();
    expect(r.rules).toEqual({ userAgent: "*", disallow: "/" });
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
