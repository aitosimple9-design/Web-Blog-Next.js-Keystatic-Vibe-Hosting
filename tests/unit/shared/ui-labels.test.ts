import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { UI_LABEL_DEFAULTS, UI_LABEL_GROUPS, fillLabel } from "@/shared/config/ui-labels";
import { parseUiLabels } from "@/shared/content/ui-labels";
import { formatReadTime } from "@/shared/format";

const keys = UI_LABEL_GROUPS.flatMap((g) => g.items.map(([k]) => k));

describe("danh sách nhãn giao diện", () => {
  it("khóa không trùng, mặc định không rỗng, id nhóm không trùng", () => {
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(UI_LABEL_GROUPS.map((g) => g.id)).size).toBe(UI_LABEL_GROUPS.length);
    for (const [k, v] of Object.entries(UI_LABEL_DEFAULTS)) expect(v.trim(), k).not.toBe("");
  });

  it("chữ mặc định giữ đúng chữ viết cứng trước đây (không đổi giao diện khi chưa sửa)", () => {
    expect(UI_LABEL_DEFAULTS).toMatchObject({
      navMain: "Chính",
      navMobile: "Menu",
      menuOpen: "Mở menu",
      menuClose: "Đóng menu",
      searchOpen: "Tìm kiếm",
      searchPlaceholder: "Tìm bài viết",
      searchEmpty: "Không tìm thấy bài phù hợp. Thử một từ khóa khác.",
      pagePrev: "Trang trước",
      pageNext: "Trang sau",
      pageN: "Trang {n}",
      readTime: "{n} phút đọc",
      readPost: "Đọc bài",
      viewTopic: "Xem bài",
    });
    expect(formatReadTime(5)).toBe(fillLabel(UI_LABEL_DEFAULTS.readTime, { n: 5 }));
  });

  it("file content/settings/ui-labels.json chỉ chứa khóa có thật và khớp nhóm", () => {
    const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "settings", "ui-labels.json"), "utf8")) as Record<string, Record<string, string>>;
    for (const g of UI_LABEL_GROUPS) {
      const allowed = new Set<string>(g.items.map(([k]) => k));
      for (const k of Object.keys(raw[g.id] ?? {})) expect(allowed.has(k), `${g.id}.${k}`).toBe(true);
    }
    for (const g of Object.keys(raw)) expect(UI_LABEL_GROUPS.some((x) => x.id === g), g).toBe(true);
  });
});

describe("parseUiLabels", () => {
  it("không có gì / sai kiểu thì dùng mặc định", () => {
    expect(parseUiLabels(undefined)).toEqual(UI_LABEL_DEFAULTS);
    expect(parseUiLabels(null)).toEqual(UI_LABEL_DEFAULTS);
    expect(parseUiLabels("x")).toEqual(UI_LABEL_DEFAULTS);
    expect(parseUiLabels({ nav: "x", search: [] })).toEqual(UI_LABEL_DEFAULTS);
  });

  it("ô có chữ thì thay, ô rỗng / khoảng trắng / sai kiểu thì giữ mặc định", () => {
    const r = parseUiLabels({ nav: { navMain: "  Menu chính  ", navFooter: "   ", navTopics: 5 }, search: { searchOpen: "Mở tìm" } });
    expect(r.navMain).toBe("Menu chính");
    expect(r.navFooter).toBe(UI_LABEL_DEFAULTS.navFooter);
    expect(r.navTopics).toBe(UI_LABEL_DEFAULTS.navTopics);
    expect(r.searchOpen).toBe("Mở tìm");
  });

  it("khóa đặt sai nhóm bị bỏ qua; chữ quá dài bị cắt", () => {
    expect(parseUiLabels({ search: { navMain: "sai nhóm" } }).navMain).toBe(UI_LABEL_DEFAULTS.navMain);
    expect(parseUiLabels({ nav: { navMain: "a".repeat(500) } }).navMain).toHaveLength(200);
  });
});

describe("fillLabel", () => {
  it("thay {n}, {name}; giữ nguyên chỗ trống không có giá trị", () => {
    expect(fillLabel("Trang {n}", { n: 3 })).toBe("Trang 3");
    expect(fillLabel("chủ đề {name}", { name: "Đọc chậm" })).toBe("chủ đề Đọc chậm");
    expect(fillLabel("{x} và {n}", { n: 1 })).toBe("{x} và 1");
  });
});
