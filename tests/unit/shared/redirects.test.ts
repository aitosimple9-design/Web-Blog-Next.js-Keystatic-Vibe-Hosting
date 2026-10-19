import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildRedirects, entryProblem, finalTarget, readRedirectFiles, type RedirectEntry } from "@/shared/redirects";
import { REDIRECT_FROM_RE, REDIRECT_TO_RE } from "@/shared/redirect-patterns";
import keystaticConfig from "../../../keystatic.config";

const e = (from: string, to: string, file = `${from.replace(/\W+/g, "-")}.json`, permanent = true): RedirectEntry => ({ file, from, to, permanent });

describe("mẫu ký tự chuyển hướng", () => {
  it("đường dẫn cũ hợp lệ", () => {
    for (const ok of ["/bai-viet/slug-cu", "/a", "/blog/chu-de-1/trang/2", "/trang_cu.html"]) expect(REDIRECT_FROM_RE.test(ok), ok).toBe(true);
  });
  it("đường dẫn cũ sai: dấu cách, hoa, ký tự đặc biệt của Next, / ở cuối, query, thiếu /", () => {
    for (const bad of ["", "/", "bai-viet/x", "/Bai-Viet/x", "/bai viet", "/x/", "/x?y=1", "/x#a", "/:slug", "/x/*", "/(a)", "/a+b", "/a/{b}", "/x[1]"]) {
      expect(REDIRECT_FROM_RE.test(bad), JSON.stringify(bad)).toBe(false);
    }
  });
  it("đích: đường dẫn trong site, trang chủ, hoặc https; không nhận chữ hoa / dấu cách / javascript:", () => {
    for (const ok of ["/", "/blog", "/bai-viet/x", "https://example.com/a?b=1", "http://example.com"]) expect(REDIRECT_TO_RE.test(ok), ok).toBe(true);
    for (const bad of ["", "blog", "/Blog", "/a b", "javascript:alert(1)", "//evil.com", "https://a b.com"]) expect(REDIRECT_TO_RE.test(bad), bad).toBe(false);
  });
  it("ô nhập trong admin (keystatic.config.ts) ép đúng các mẫu này: nhập sai thì validate() ném lỗi", () => {
    type F = { validate: (v: string) => string };
    const schema = (keystaticConfig.collections as unknown as Record<string, { schema: Record<string, F> }>).redirects.schema;
    expect(() => schema.from.validate("/bai-viet/slug-cu")).not.toThrow();
    for (const bad of ["bai-viet/x", "/Bai-Viet/x", "/x y", "/:slug", "/x/", ""]) expect(() => schema.from.validate(bad), JSON.stringify(bad)).toThrow();
    expect(() => schema.to.validate("/bai-viet/slug-moi")).not.toThrow();
    expect(() => schema.to.validate("https://example.com/x")).not.toThrow();
    for (const bad of ["blog", "/Blog", "javascript:alert(1)", ""]) expect(() => schema.to.validate(bad), JSON.stringify(bad)).toThrow();
  });
});

describe("entryProblem", () => {
  it("mục đúng thì không có vấn đề", () => expect(entryProblem(e("/bai-viet/cu", "/bai-viet/moi"))).toBeNull());
  it("bắt thiếu ô, sai mẫu, trùng nhau, đường dẫn hệ thống", () => {
    expect(entryProblem(e("", "/x"))).toContain("thiếu");
    expect(entryProblem(e("/x", ""))).toContain("thiếu");
    expect(entryProblem(e("/Bai", "/x"))).toContain("sai mẫu");
    expect(entryProblem(e("/x", "ko-hop-le"))).toContain("sai mẫu");
    expect(entryProblem(e("/x", "/x"))).toContain("trùng");
    for (const p of ["/keystatic", "/keystatic/singleton/trang-chu", "/api/ten-sach", "/xem-truoc/bai-viet/x", "/_next/static/a"]) {
      expect(entryProblem(e(p, "/blog")), p).toContain("hệ thống");
    }
  });
});

describe("buildRedirects: web không bao giờ hỏng vì dữ liệu chuyển hướng", () => {
  it("dựng đúng nguồn / đích / loại (vĩnh viễn hoặc tạm thời)", () => {
    expect(buildRedirects([e("/a", "/b"), e("/c", "https://x.com", "c.json", false)])).toEqual([
      { source: "/a", destination: "/b", permanent: true },
      { source: "/c", destination: "https://x.com", permanent: false },
    ]);
  });
  it("bỏ mục sai mẫu (không để source lạ làm sập build)", () => {
    expect(buildRedirects([e("/:x(.*)", "/b"), e("/ok", "/b"), e("/keystatic", "/b")])).toEqual([{ source: "/ok", destination: "/b", permanent: true }]);
  });
  it("trùng đường dẫn cũ: giữ mục đầu", () => {
    expect(buildRedirects([e("/a", "/b", "1.json"), e("/a", "/c", "2.json")])).toEqual([{ source: "/a", destination: "/b", permanent: true }]);
  });
  it("chuỗi nối tiếp được gộp về đích cuối (một lần chuyển)", () => {
    expect(buildRedirects([e("/a", "/b"), e("/b", "/c")])).toEqual([
      { source: "/a", destination: "/c", permanent: true },
      { source: "/b", destination: "/c", permanent: true },
    ]);
  });
  it("vòng lặp bị loại hết, không treo", () => {
    expect(buildRedirects([e("/a", "/b"), e("/b", "/a")])).toEqual([]);
    expect(finalTarget("/a", new Map([["/a", "/b"], ["/b", "/a"]]))).toBeNull();
  });
  it("giới hạn số mục", () => {
    const many = Array.from({ length: 1100 }, (_, i) => e(`/cu-${i}`, "/blog"));
    expect(buildRedirects(many)).toHaveLength(1000);
  });
});

describe("readRedirectFiles", () => {
  const mk = (files: Record<string, string>) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "redir-"));
    fs.mkdirSync(path.join(root, "content", "redirects"), { recursive: true });
    for (const [n, t] of Object.entries(files)) fs.writeFileSync(path.join(root, "content", "redirects", n), t);
    return root;
  };
  it("không có thư mục: danh sách rỗng", () => expect(readRedirectFiles(fs.mkdtempSync(path.join(os.tmpdir(), "redir-")))).toEqual([]));
  it("đọc đủ ô; thiếu `permanent` = vĩnh viễn; file hỏng thành mục rỗng (bị bỏ sau đó)", () => {
    const root = mk({
      "a.json": JSON.stringify({ label: "A", from: " /a ", to: "/b" }),
      "b.json": JSON.stringify({ from: "/c", to: "/d", permanent: false }),
      "hong.json": "{không phải json",
    });
    const r = readRedirectFiles(root);
    expect(r.find((x) => x.file === "a.json")).toMatchObject({ from: "/a", to: "/b", permanent: true });
    expect(r.find((x) => x.file === "b.json")?.permanent).toBe(false);
    expect(r.find((x) => x.file === "hong.json")).toMatchObject({ from: "", to: "" });
    expect(buildRedirects(r).map((x) => x.source).sort()).toEqual(["/a", "/c"]);
  });
});
