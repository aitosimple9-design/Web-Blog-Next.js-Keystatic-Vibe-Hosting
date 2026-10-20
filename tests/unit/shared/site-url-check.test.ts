import { describe, expect, it } from "vitest";
import { checkSiteUrl, isProductionEnv } from "@/shared/site-url-check";

const prod = (url?: string) => checkSiteUrl({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: url });

describe("checkSiteUrl: chỉ production thật mới bị coi là lỗi", () => {
  it("nhận biết production giống isIndexable", () => {
    expect(isProductionEnv({ VERCEL_ENV: "production" })).toBe(true);
    expect(isProductionEnv({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isProductionEnv({ ALLOW_INDEXING: "true" })).toBe(true);
    expect(isProductionEnv({})).toBe(false);
  });

  it("máy cá nhân và bản preview dùng localhost / để trống vẫn ổn (mức dev)", () => {
    expect(checkSiteUrl({}).level).toBe("dev");
    expect(checkSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }).level).toBe("dev");
    expect(checkSiteUrl({ VERCEL_ENV: "preview", NEXT_PUBLIC_SITE_URL: "" }).level).toBe("dev");
  });

  it("production: để trống, localhost, 127.0.0.1 → lỗi", () => {
    expect(prod(undefined).level).toBe("error");
    expect(prod("   ").level).toBe("error");
    expect(prod("http://localhost:3000").level).toBe("error");
    expect(prod("https://localhost").level).toBe("error");
    expect(prod("http://127.0.0.1:3000").level).toBe("error");
  });

  it("production: sai dạng (không https, dấu / cuối, có đường dẫn, không phải URL) → lỗi", () => {
    expect(prod("http://example.com").level).toBe("error");
    expect(prod("https://example.com/").level).toBe("error");
    expect(prod("https://example.com/blog").level).toBe("error");
    expect(prod("example.com").level).toBe("error");
  });

  it("lỗi có hướng dẫn sửa", () => {
    expect(prod("http://localhost:3000").message).toContain("Redeploy");
  });

  it("production: địa chỉ vercel.app → cảnh báo, tên miền thật → ổn", () => {
    expect(prod("https://abc.vercel.app").level).toBe("warn");
    expect(prod("https://blog.example.com").level).toBe("ok");
  });

  it("host không phải Vercel: ALLOW_INDEXING=true cũng được kiểm như production", () => {
    expect(checkSiteUrl({ ALLOW_INDEXING: "true", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }).level).toBe("error");
  });
});
