import { describe, expect, it } from "vitest";
import { splitLabel } from "@/cms/ui/settings-card-text";

describe("splitLabel (tách nhãn ô thành tiêu đề / mô tả / chân thẻ)", () => {
  it("nhãn không có ngoặc: chỉ có tiêu đề", () => {
    expect(splitLabel("Mô tả ngắn")).toEqual({ title: "Mô tả ngắn", description: "", footer: "" });
  });

  it("phần trong ngoặc CUỐI là mô tả", () => {
    expect(splitLabel("Tên site (hiện ở tiêu đề tab trình duyệt và khi chia sẻ link)")).toEqual({
      title: "Tên site",
      description: "Hiện ở tiêu đề tab trình duyệt và khi chia sẻ link.",
      footer: "",
    });
  });

  it('câu "để trống ..." tách xuống chân thẻ, phần còn lại là mô tả', () => {
    expect(splitLabel("Mô tả trang khi chia sẻ (≤ 160 ký tự; để trống = dùng mô tả của Cài đặt site)")).toEqual({
      title: "Mô tả trang khi chia sẻ",
      description: "≤ 160 ký tự.",
      footer: "Để trống = dùng mô tả của Cài đặt site.",
    });
  });

  it('"mặc định: ..." đi xuống chân thẻ, thẻ không có mô tả', () => {
    expect(splitLabel("Lời chào phía trên tên (mặc định: Xin chào, mình là)")).toEqual({
      title: "Lời chào phía trên tên",
      description: "",
      footer: "Mặc định: Xin chào, mình là.",
    });
  });

  it("đếm ngoặc lồng nhau, không cắt nhầm", () => {
    const r = splitLabel("Tiêu đề tab (hiện thành: <tiêu đề> — <tên site (rút gọn)>)");
    expect(r.title).toBe("Tiêu đề tab");
    expect(r.description).toContain("<tên site (rút gọn)>");
  });

  it("ngoặc ở giữa nhãn (không phải cuối) giữ nguyên trong tiêu đề", () => {
    expect(splitLabel("Đường dẫn (breadcrumb) ở trang Blog và trang bài").title).toBe("Đường dẫn (breadcrumb) ở trang Blog và trang bài");
  });

  it('dấu hai chấm: phần sau thành mô tả ("Các khối của trang: ...")', () => {
    const r = splitLabel("Các khối của trang: tích = hiện khối");
    expect(r.title).toBe("Các khối của trang");
    expect(r.description).toBe("Tích = hiện khối.");
  });

  it("chuỗi rỗng / khoảng trắng nhiều không làm hỏng", () => {
    expect(splitLabel("  ").title).toBe("");
    expect(splitLabel("Tên   site\n (a)").title).toBe("Tên site");
  });
});
