import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Lấy một bài thật từ content/posts để thử trang chi tiết (không viết cứng slug).
const dir = path.join(process.cwd(), "content", "posts");
const file = fs.readdirSync(dir).find((f) => f.endsWith(".md"))!;
const postSlug = matter(fs.readFileSync(path.join(dir, file), "utf8")).data.slug as string;

const pages = [
  { name: "Trang chủ", url: "/" },
  { name: "Book", url: "/book" },
  { name: "Blog", url: "/blog" },
  { name: "Chi tiết bài", url: `/bai-viet/${postSlug}` },
];

// 5 mốc bắt buộc (CLAUDE.md mục 6) + 2 điểm giữa để bắt lỗi reflow
const widths = [375, 414, 600, 768, 900, 1024, 1440];

for (const p of pages) {
  test.describe(p.name, () => {
    test("có title, meta description và Open Graph", async ({ page }) => {
      const res = await page.goto(p.url);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
    });

    for (const w of widths) {
      test(`không tràn ngang ở ${w}px`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(p.url);
        await page.waitForLoadState("networkidle");
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test("không có lỗi JavaScript trên trang", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(p.url);
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
    });
  });
}

test("bài không tồn tại trả 404", async ({ page }) => {
  const res = await page.goto("/bai-viet/khong-ton-tai-xyz");
  expect(res?.status()).toBe(404);
});

test("robots.txt và sitemap.xml hoạt động, sitemap chứa bài", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");
  const sm = await request.get("/sitemap.xml");
  expect(sm.ok()).toBe(true);
  expect(await sm.text()).toContain(`/bai-viet/${postSlug}`);
});

test("trang quản trị Keystatic mở được và không bị lập chỉ mục", async ({ page }) => {
  const res = await page.goto("/keystatic");
  expect(res?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("sitemap không chứa trang quản trị", async ({ request }) => {
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/keystatic");
});

test("theme: mặc định theo hệ thống, ưu tiên lựa chọn đã lưu", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.evaluate(() => localStorage.setItem("theme", "light"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

// Nhãn giao diện nhỏ lấy từ Keystatic → Cài đặt → Nhãn giao diện (content/settings/ui-labels.json); mặc định phải đúng chữ cũ viết cứng trong mã
test.describe("Nhãn giao diện (aria-label, nút) giữ đúng chữ mặc định", () => {
  test("thanh đầu trang, liên kết bỏ qua, nút đổi theme, ô tìm kiếm", async ({ page }) => {
    await page.goto("/book");
    await expect(page.locator(".skip-link")).toHaveText("Bỏ qua, đến nội dung chính");
    await expect(page.locator('nav[aria-label="Chính"]')).toHaveCount(1);
    await expect(page.locator('button[aria-label="Mở menu"]')).toHaveCount(1);
    await expect(page.locator('button[aria-label^="Chuyển sang theme"], button[aria-label="Đổi theme"]').first()).toBeVisible();
    await expect(page.locator('button[aria-label="Tìm kiếm"]')).toHaveCount(1);
    await expect(page.locator('footer nav[aria-label="Chân trang"]')).toHaveCount(1);
  });

  test("thẻ bài hiện thời gian đọc và Phân trang ở Blog đúng chữ", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByText(/\d+ phút đọc|\d+ phút/).first()).toBeVisible();
    await expect(page.getByText("Đọc bài").first()).toBeVisible();
    await expect(page.locator('nav[aria-label="Phân trang"]')).toHaveCount(1);
    await expect(page.locator('a[aria-label="Trang sau"]')).toHaveCount(1);
  });
});
