import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { adminLinkFor, groupByFile, labelFor } from "@/cms/lib/check-links";
import { DASHBOARD_ROUTE } from "@/cms/ui/KeystaticContentCheck";

describe("adminLinkFor", () => {
  it("mục của collection → trang sửa, có /branch/<nhánh>/ ở chế độ GitHub", () => {
    expect(adminLinkFor("content/posts/bai-a.md", null)).toBe("/keystatic/collection/posts/item/bai-a");
    expect(adminLinkFor("content/topics/cd.json", "test/x")).toBe("/keystatic/branch/test%2Fx/collection/topics/item/cd");
    expect(adminLinkFor("content/redirects/cu.json", null)).toBe("/keystatic/collection/redirects/item/cu");
  });

  it("file của singleton → trang singleton", () => {
    expect(adminLinkFor("content/pages/trang-chu.json", null)).toBe("/keystatic/singleton/homePage");
    expect(adminLinkFor("content/pages/lien-he.md", "nhanh")).toBe("/keystatic/branch/nhanh/singleton/contactPage");
  });

  it("không phải mục sửa được (ảnh, biến môi trường, sai đuôi) → null", () => {
    expect(adminLinkFor("public/images/posts/cu", null)).toBeNull();
    expect(adminLinkFor("NEXT_PUBLIC_SITE_URL", null)).toBeNull();
    expect(adminLinkFor("content/posts/bai.json", null)).toBeNull();
    expect(adminLinkFor("content/khac/x.json", null)).toBeNull();
  });

  it("bảng singleton khớp đường dẫn trong keystatic.config.ts", () => {
    const config = fs.readFileSync(path.join(process.cwd(), "keystatic.config.ts"), "utf8");
    for (const [file, name] of [
      ["content/settings/site.json", "siteSettings"],
      ["content/pages/trang-chu.json", "homePage"],
      ["content/pages/lien-he.md", "contactPage"],
    ]) {
      expect(config).toMatch(new RegExp(`${name}: singleton\\(\\{[\\s\\S]{0,200}path: "${file.replace(/\.(json|md)$/, "")}"`));
      expect(adminLinkFor(file, null)).toBe(`/keystatic/singleton/${name}`);
    }
  });
});

describe("labelFor", () => {
  it("tên dễ đọc theo loại mục", () => {
    expect(labelFor("content/posts/bai-a.md")).toBe("Bài viết · bai-a");
    expect(labelFor("content/subtopics/con.json")).toBe("Chủ đề con · con");
    expect(labelFor("content/pages/trang-chu.json")).toBe("Trang chủ");
    expect(labelFor("public/images/posts/cu")).toBe("Ảnh · posts/cu");
    expect(labelFor("NEXT_PUBLIC_SITE_URL")).toBe("NEXT_PUBLIC_SITE_URL");
    expect(labelFor("")).toBe("Chung");
  });
});

describe("groupByFile", () => {
  it("gộp theo file, giữ thứ tự, tách lời nhắn sau dấu ': ' đầu tiên", () => {
    const g = groupByFile(["content/posts/a.md: thiếu x", "content/topics/t.json: lỗi: có hai chấm", "content/posts/a.md: thiếu y", "không có file"], null);
    expect(g.map((x) => x.where)).toEqual(["content/posts/a.md", "content/topics/t.json", ""]);
    expect(g[0].messages).toEqual(["thiếu x", "thiếu y"]);
    expect(g[1].messages).toEqual(["lỗi: có hai chấm"]);
    expect(g[0].link).toBe("/keystatic/collection/posts/item/a");
    expect(g[2]).toMatchObject({ link: null, messages: ["không có file"] });
  });
});

describe("DASHBOARD_ROUTE", () => {
  it("chỉ nhận Dashboard (cả chế độ GitHub)", () => {
    expect(DASHBOARD_ROUTE.test("/keystatic")).toBe(true);
    expect(DASHBOARD_ROUTE.test("/keystatic/")).toBe(true);
    expect(DASHBOARD_ROUTE.test("/keystatic/branch/main")).toBe(true);
    expect(DASHBOARD_ROUTE.test("/keystatic/collection/posts")).toBe(false);
    expect(DASHBOARD_ROUTE.test("/keystatic/branch/main/collection/posts")).toBe(false);
  });
});
