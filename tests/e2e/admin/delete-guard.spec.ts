import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Hộp "Delete entry" ở trang sửa Chủ đề có thêm dòng cảnh báo khi chủ đề đang có bài dùng (src/cms/ui/KeystaticDeleteGuard.tsx).
// CHỈ ĐỌC: mở hộp xóa rồi bấm Cancel, không bấm "Yes, delete".
const usedTopic = (() => {
  const dir = path.join(process.cwd(), "content", "posts");
  const file = fs.readdirSync(dir).find((f) => f.endsWith(".md"))!;
  return String(matter(fs.readFileSync(path.join(dir, file), "utf8")).data.category);
})();

test("xóa chủ đề đang có bài: hộp xác nhận hiện cảnh báo", async ({ page }) => {
  await page.goto(`/keystatic/collection/topics/item/${usedTopic}`);
  const del = page.getByRole("button", { name: "Delete entry" });
  await expect(del).toBeVisible({ timeout: 60_000 });
  await del.click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("alert")).toContainText("Chủ đề này đang được dùng bởi");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
});
