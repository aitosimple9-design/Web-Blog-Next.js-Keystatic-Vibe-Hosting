import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import path from "node:path";

// /api/kiem-tra ở chế độ local (máy soạn bài): chạy cùng bộ luật với `npm run check-content`, nên số lỗi phải khớp.
test("chế độ local: kết quả khớp với npm run check-content", async ({ request }) => {
  const res = await request.get("/api/kiem-tra");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toMatchObject({ ok: true, mode: "local" });
  const cli = spawnSync(process.execPath, [path.join(process.cwd(), "scripts", "check-content.mjs"), "--base", "main"], { encoding: "utf8" });
  const errors = /\nLỖI \((\d+)\)/.exec(cli.stdout)?.[1] ?? "0";
  expect(body.result.errors.length).toBe(Number(errors));
  expect(body.result.counts.posts).toBeGreaterThan(0);
});

// Thẻ "Kiểm tra nội dung" ở đầu Dashboard: hiện trạng thái Đạt / Chưa đạt và số mục đã kiểm tra. Chỉ đọc (bấm "Kiểm tra lại" không ghi gì).
test("Dashboard có thẻ Kiểm tra nội dung, bấm Kiểm tra lại chạy lại", async ({ page }) => {
  await page.goto("/keystatic");
  const card = page.locator("[data-ks-content-check]");
  await expect(card.getByRole("heading", { name: "Kiểm tra nội dung" })).toBeVisible({ timeout: 60_000 });
  await expect(card.getByText(/^(Đạt|Chưa đạt):/)).toBeVisible({ timeout: 30_000 });
  await expect(card.getByText(/Đã kiểm tra \d+ bài/)).toBeVisible();
  // thẻ nằm trước khối "Nội dung" của Dashboard
  const order = await page.evaluate(() => {
    const card = document.querySelector("[data-ks-content-check]")!;
    const content = [...document.querySelectorAll("#keystatic-main-panel section > h2")].find((h) => h.textContent === "Nội dung")!.parentElement!;
    return card.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING;
  });
  expect(order).toBeTruthy();
  await card.getByRole("button", { name: "Kiểm tra lại" }).click();
  await expect(card.getByText(/^(Đạt|Chưa đạt):/)).toBeVisible({ timeout: 30_000 });
});
