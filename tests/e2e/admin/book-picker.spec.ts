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
// Chủ đề con chỉ hiện các mục thuộc chủ đề đang chọn; hộp "Thêm chủ đề con mới" chọn sẵn chủ đề đó.
const readDir = (dir: string) => {
  const d = path.join(process.cwd(), "content", dir);
  return fs
    .readdirSync(d)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ slug: f.slice(0, -5), ...(JSON.parse(fs.readFileSync(path.join(d, f), "utf8")) as { name: string; topic?: string }) }));
};

test("ô Chủ đề và Chủ đề con: lọc theo chủ đề, mở hộp Thêm mới", async ({ page }) => {
  const subtopics = readDir("subtopics");
  const chosen = readDir("topics").find((t) => subtopics.some((s) => s.topic === t.slug))!;
  const inTopic = subtopics.find((s) => s.topic === chosen.slug)!;
  const otherTopic = subtopics.find((s) => s.topic !== chosen.slug)!;

  await page.goto("/keystatic/collection/posts/create");
  const topic = page.getByRole("combobox", { name: "Chủ đề", exact: true });
  await expect(topic).toBeVisible({ timeout: 60_000 });
  await topic.click();
  await page.getByRole("option", { name: chosen.name }).click();
  await expect(topic).toContainText(chosen.name);

  const subs = page.getByRole("combobox", { name: /^Chủ đề con/ });
  await subs.click();
  const sub = page.getByRole("option", { name: inTopic.name });
  await sub.click();
  await expect(sub).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("option", { name: otherTopic.name })).toHaveCount(0);
  await page.getByRole("button", { name: "+ Thêm chủ đề con mới" }).click();
  const dialog = page.getByRole("dialog", { name: "Thêm chủ đề con mới" });
  // ô chọn chủ đề cha của chủ đề con (thẻ select gốc), chọn sẵn chủ đề của bài
  await expect(dialog.getByRole("combobox", { name: /Chủ đề \(bắt buộc\)/ })).toHaveValue(chosen.slug);
  await expect(dialog.getByRole("button", { name: "Tạo" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
