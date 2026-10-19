import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isIndexable } from "@/frontend/lib/indexing";

describe("isIndexable: chỉ production thật mới được lập chỉ mục", () => {
  it("Vercel production: được", () => expect(isIndexable({ VERCEL_ENV: "production" })).toBe(true));
  it("Vercel preview / development: bị chặn", () => {
    expect(isIndexable({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isIndexable({ VERCEL_ENV: "development" })).toBe(false);
  });
  it("Vercel preview vẫn bị chặn dù ALLOW_INDEXING=true (VERCEL_ENV quyết định)", () => {
    expect(isIndexable({ VERCEL_ENV: "preview", ALLOW_INDEXING: "true" })).toBe(false);
  });
  it("ngoài Vercel: mặc định chặn, chỉ ALLOW_INDEXING=true mới mở", () => {
    expect(isIndexable({})).toBe(false);
    expect(isIndexable({ ALLOW_INDEXING: "1" })).toBe(false);
    expect(isIndexable({ ALLOW_INDEXING: "true" })).toBe(true);
  });
  it("next.config.ts dùng đúng cùng điều kiện (không lệch với src/lib/indexing.ts)", () => {
    const src = fs.readFileSync(path.join(process.cwd(), "next.config.ts"), "utf8");
    expect(src).toContain('process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.ALLOW_INDEXING === "true"');
  });
});
