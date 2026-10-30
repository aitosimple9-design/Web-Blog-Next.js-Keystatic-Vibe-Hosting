import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createEntryLocal, listEntries, planEntry } from "@/cms/lib/entry-store";

let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "entry-store-"));
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

const write = (dir: string, slug: string, data: object) => {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(path.join(root, dir, `${slug}.json`), JSON.stringify(data));
};

describe("planEntry", () => {
  it("sách: slug không dấu từ tên, dữ liệu chỉ có name", () => {
    const p = planEntry("books", { name: "  Đắc Nhân Tâm " }, []);
    expect(p).toMatchObject({ ok: true, slug: "dac-nhan-tam", file: "dac-nhan-tam.json", data: { name: "Đắc Nhân Tâm" } });
  });
  it("chặn tên trống, slug trùng", () => {
    expect(planEntry("books", { name: " " }, [])).toMatchObject({ ok: false });
    expect(planEntry("books", { name: "Sách A" }, [{ slug: "sach-a", name: "Sách A" }])).toMatchObject({ ok: false });
  });
  it("chủ đề cần mô tả ≤ 200, thứ tự mặc định = lớn nhất + 1", () => {
    expect(planEntry("topics", { name: "Tâm lý" }, [])).toMatchObject({ ok: false });
    expect(planEntry("topics", { name: "Tâm lý", description: "x".repeat(201) }, [])).toMatchObject({ ok: false });
    const p = planEntry("topics", { name: "Tâm lý", description: "Mô tả" }, [{ slug: "a", name: "A", order: 3 }]);
    expect(p).toMatchObject({ ok: true, data: { name: "Tâm lý", order: 4, description: "Mô tả" } });
  });
  it("chủ đề con cần chủ đề có thật, không dùng slug 'trang'", () => {
    const topics = [{ slug: "tam-ly", name: "Tâm lý" }];
    expect(planEntry("subtopics", { name: "Con", description: "d", topic: "khong-co" }, [], topics)).toMatchObject({ ok: false });
    expect(planEntry("subtopics", { name: "Trang", description: "d", topic: "tam-ly" }, [], topics)).toMatchObject({ ok: false });
    expect(planEntry("subtopics", { name: "Con", description: "d", topic: "tam-ly" }, [], topics)).toMatchObject({ ok: true, data: { topic: "tam-ly", order: 1 } });
  });
});

describe("createEntryLocal / listEntries", () => {
  it("ghi file đúng chỗ và liệt kê lại được, không ghi đè", () => {
    write("content/books", "cu", { name: "Cũ" });
    expect(createEntryLocal("books", { name: "Mới" }, root)).toMatchObject({ ok: true });
    expect(JSON.parse(fs.readFileSync(path.join(root, "content/books/moi.json"), "utf8"))).toEqual({ name: "Mới" });
    expect(listEntries("books", root).map((i) => i.slug).sort()).toEqual(["cu", "moi"]);
    expect(createEntryLocal("books", { name: "Mới" }, root)).toMatchObject({ ok: false });
  });
  it("bỏ qua file hỏng và thư mục chưa có", () => {
    expect(listEntries("topics", root)).toEqual([]);
    fs.mkdirSync(path.join(root, "content/topics"), { recursive: true });
    fs.writeFileSync(path.join(root, "content/topics/hong.json"), "{");
    expect(listEntries("topics", root)).toEqual([]);
  });
});
