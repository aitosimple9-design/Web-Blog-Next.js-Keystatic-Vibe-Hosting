import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Ô "Tên sách" trong form bài là danh sách chọn lấy từ mục Sách, có nút "+ Thêm sách mới" mở hộp thoại.
// CHỈ ĐỌC: chọn một cuốn trong bộ nhớ trình duyệt, mở hộp thoại rồi đóng; không bấm Tạo / Lưu (việc tạo thật đã có test đơn vị cho entry-store).
const bookName = (() => {
  const dir = path.join(process.cwd(), "content", "books");
  const file = fs.readdirSync(dir).find((f) => f.endsWith(".json"))!;
  return (JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as { name: string }).name;
})();

test("ô Tên sách: chọn trong danh sách và mở hộp Thêm sách mới", async ({ page }) => {
  await page.goto("/keystatic/collection/posts/create");
  const box = page.getByRole("combobox", { name: "Tên sách" });
  await expect(box).toBeVisible({ timeout: 60_000 });
  await expect(box).toContainText("Chọn sách");

  await box.click();
  await expect(page.getByRole("option", { name: bookName })).toBeVisible();
  await page.getByRole("option", { name: bookName }).click();
  await expect(box).toContainText(bookName);

  await box.click();
  await page.getByRole("button", { name: "+ Thêm sách mới" }).click();
  const dialog = page.getByRole("dialog", { name: "Thêm sách mới" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Tạo" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

// Chủ đề (chọn một) và Chủ đề con (chọn nhiều) cũng là danh sách chọn có nút Thêm mới. Chỉ đọc, như trên.
const firstName = (dir: string) => {
  const d = path.join(process.cwd(), "content", dir);
  const file = fs.readdirSync(d).find((f) => f.endsWith(".json"))!;
  return (JSON.parse(fs.readFileSync(path.join(d, file), "utf8")) as { name: string }).name;
};

test("ô Chủ đề và Chủ đề con: chọn trong danh sách, mở hộp Thêm mới", async ({ page }) => {
  await page.goto("/keystatic/collection/posts/create");
  const topic = page.getByRole("combobox", { name: "Chủ đề", exact: true });
  await expect(topic).toBeVisible({ timeout: 60_000 });
  await topic.click();
  await page.getByRole("option", { name: firstName("topics") }).click();
  await expect(topic).toContainText(firstName("topics"));

  const subs = page.getByRole("combobox", { name: /^Chủ đề con/ });
  await subs.click();
  const sub = page.getByRole("option", { name: firstName("subtopics") });
  await sub.click();
  await expect(sub).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "+ Thêm chủ đề con mới" }).click();
  const dialog = page.getByRole("dialog", { name: "Thêm chủ đề con mới" });
  // ô chọn chủ đề cha của chủ đề con (thẻ select gốc)
  await expect(dialog.getByRole("combobox", { name: /Chủ đề \(bắt buộc\)/ })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Tạo" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
