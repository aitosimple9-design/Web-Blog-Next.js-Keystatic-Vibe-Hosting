import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { LEGAL_PAGES, readLegalPage, resolveLegalLinks } from "@/lib/legal-pages";

const mk = (files: Record<string, string>) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "legal-"));
  fs.mkdirSync(path.join(root, "content", "pages"), { recursive: true });
  for (const [n, t] of Object.entries(files)) fs.writeFileSync(path.join(root, "content", "pages", n), t);
  return root;
};

describe("readLegalPage: trang trống thì ẨN", () => {
  it("chưa có file: ẩn", () => {
    expect(readLegalPage("privacy", mk({}))).toBeNull();
    expect(readLegalPage("contact", mk({}))).toBeNull();
  });
  it("có file nhưng thân rỗng (Keystatic ghi frontmatter rỗng): ẩn", () => {
    expect(readLegalPage("privacy", mk({ "chinh-sach-rieng-tu.md": "---\n{}\n---\n\n" }))).toBeNull();
    expect(readLegalPage("privacy", mk({ "chinh-sach-rieng-tu.md": "---\ntitle: Tên\n---\n   \n" }))).toBeNull();
  });
  it("có chữ: hiện, tiêu đề mặc định khi để trống, đọc được mô tả và ngày cập nhật", () => {
    const p = readLegalPage("privacy", mk({ "chinh-sach-rieng-tu.md": "---\nupdated: 2026-10-17\ndescription: Mô tả\n---\nNội dung.\n" }));
    expect(p).toMatchObject({ id: "privacy", title: "Chính sách riêng tư", description: "Mô tả", updated: "2026-10-17", body: "Nội dung." });
  });
  it("tiêu đề do admin đặt được dùng", () => {
    expect(readLegalPage("privacy", mk({ "chinh-sach-rieng-tu.md": "---\ntitle: Quyền riêng tư\n---\nX\n" }))?.title).toBe("Quyền riêng tư");
  });
  it("Liên hệ: hiện khi chỉ có email hợp lệ; email sai và không có chữ thì ẩn; trang chính sách bỏ qua ô email", () => {
    expect(readLegalPage("contact", mk({ "lien-he.md": "---\nemail: a@b.com\n---\n" }))).toMatchObject({ email: "a@b.com", body: "" });
    expect(readLegalPage("contact", mk({ "lien-he.md": "---\nemail: khong-phai-email\n---\n" }))).toBeNull();
    expect(readLegalPage("contact", mk({ "lien-he.md": "---\nemail: sai\n---\nCó chữ\n" }))).toMatchObject({ email: undefined, body: "Có chữ" });
    expect(readLegalPage("privacy", mk({ "chinh-sach-rieng-tu.md": "---\nemail: a@b.com\n---\nX\n" }))?.email).toBeUndefined();
  });
  it("file hỏng: ẩn, không làm sập", () => {
    expect(readLegalPage("privacy", mk({ "chinh-sach-rieng-tu.md": "---\n: : [\n---\nX" }))).toBeNull();
  });
});

describe("resolveLegalLinks: chân trang", () => {
  const priv = { href: LEGAL_PAGES.privacy.href, title: "Chính sách riêng tư" };
  const contact = { href: LEGAL_PAGES.contact.href, title: "Liên hệ" };
  const admin = [
    { label: "Điều khoản", href: "" },
    { label: "Chính sách", href: "" },
  ];
  it("không có trang nào hiện: giữ nguyên liên kết của admin", () => expect(resolveLegalLinks(admin, [])).toEqual(admin));
  it("liên kết admin chưa có địa chỉ mà nhãn khớp trang đang hiện thì nối vào trang đó (không thêm bản trùng)", () => {
    expect(resolveLegalLinks(admin, [priv])).toEqual([
      { label: "Điều khoản", href: "" },
      { label: "Chính sách", href: "/chinh-sach-rieng-tu" },
    ]);
  });
  it("trang chưa có liên kết nào thì thêm vào cuối", () => {
    expect(resolveLegalLinks([{ label: "Điều khoản", href: "" }], [priv, contact])).toEqual([
      { label: "Điều khoản", href: "" },
      { label: "Chính sách riêng tư", href: "/chinh-sach-rieng-tu" },
      { label: "Liên hệ", href: "/lien-he" },
    ]);
  });
  it("admin đã tự đặt địa chỉ tới trang thì không thêm lần nữa", () => {
    expect(resolveLegalLinks([{ label: "Riêng tư", href: "/chinh-sach-rieng-tu" }], [priv])).toEqual([{ label: "Riêng tư", href: "/chinh-sach-rieng-tu" }]);
  });
  it("trang chính sách ẨN thì liên kết 'Chính sách' vẫn chỉ là chữ", () => {
    expect(resolveLegalLinks(admin, [contact])[1]).toEqual({ label: "Chính sách", href: "" });
  });
});
