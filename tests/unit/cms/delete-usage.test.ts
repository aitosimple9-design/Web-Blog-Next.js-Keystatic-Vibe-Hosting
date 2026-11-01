import { describe, expect, it } from "vitest";
import { deleteWarning, type UsageStats } from "@/cms/lib/delete-usage";
import { DELETE_GUARD_ROUTE } from "@/cms/ui/KeystaticDeleteGuard";

const stats: UsageStats = {
  topics: { "cd-1": { subtopics: 2, posts: 4 }, trong: { subtopics: 0, posts: 0 } },
  subtopics: { "con-a": { posts: 3 }, "con-trong": { posts: 0 } },
  books: { "sach-a": { posts: 2 }, "sach-trong": { posts: 0 } },
  shelf: { topics: { "cd-1": 5 }, books: { "sach-a": 1, "chi-tu-sach": 1 } },
};

describe("deleteWarning", () => {
  it("chủ đề đang dùng: liệt kê bài, chủ đề con, bìa tủ sách và nhắc tạo chuyển hướng", () => {
    const w = deleteWarning(stats, "topics", "cd-1")!;
    expect(w).toContain("4 bài viết, 2 chủ đề con, 5 bìa ở Tủ sách Trang chủ");
    expect(w).toContain("/blog/cd-1");
    expect(w).not.toContain("main");
  });

  it("chủ đề con và sách đang dùng", () => {
    expect(deleteWarning(stats, "subtopics", "con-a")).toContain("3 bài viết");
    expect(deleteWarning(stats, "books", "sach-a")).toContain("2 bài viết, 1 bìa ở Tủ sách Trang chủ");
    // sách không bài nào ghi tên nhưng có trên tủ sách vẫn cảnh báo
    expect(deleteWarning(stats, "books", "chi-tu-sach")).toContain("1 bìa ở Tủ sách");
  });

  it("không ai dùng, hoặc không có số liệu: không cảnh báo", () => {
    expect(deleteWarning(stats, "topics", "trong")).toBeNull();
    expect(deleteWarning(stats, "subtopics", "con-trong")).toBeNull();
    expect(deleteWarning(stats, "books", "sach-trong")).toBeNull();
    expect(deleteWarning(stats, "topics", "khong-co")).toBeNull();
    expect(deleteWarning({ topics: {}, subtopics: {} }, "books", "sach-a")).toBeNull();
  });

  it("đang ở nhánh (chế độ GitHub): ghi chú số liệu theo bản đã merge", () => {
    expect(deleteWarning(stats, "subtopics", "con-a", true)).toContain("đã merge vào main");
  });
});

describe("DELETE_GUARD_ROUTE", () => {
  it("nhận trang sửa Chủ đề / Chủ đề con / Sách, cả địa chỉ có /branch/<nhánh>/", () => {
    expect(DELETE_GUARD_ROUTE.exec("/keystatic/collection/topics/item/cd-1")?.slice(1)).toEqual(["topics", "cd-1"]);
    expect(DELETE_GUARD_ROUTE.exec("/keystatic/branch/test%2Fx/collection/books/item/sach-a")?.slice(1)).toEqual(["books", "sach-a"]);
    expect(DELETE_GUARD_ROUTE.test("/keystatic/collection/subtopics/item/con-a/")).toBe(true);
  });

  it("không nhận trang khác", () => {
    expect(DELETE_GUARD_ROUTE.test("/keystatic/collection/posts/item/bai")).toBe(false);
    expect(DELETE_GUARD_ROUTE.test("/keystatic/collection/topics")).toBe(false);
    expect(DELETE_GUARD_ROUTE.test("/keystatic/collection/topics/create")).toBe(false);
  });
});
