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

// ---------- Chủ đề con (/blog/<chủ đề>/<chủ đề con>) ----------
// Dữ liệu lấy từ content/ (không viết cứng): chủ đề có nhiều chủ đề con có bài nhất, để thử thanh trượt.
const readJson = (rel: string) => JSON.parse(fs.readFileSync(path.join(process.cwd(), rel), "utf8"));
const subDir = path.join(process.cwd(), "content", "subtopics");
const subs = fs.readdirSync(subDir).filter((f) => f.endsWith(".json")).map((f) => ({ slug: f.slice(0, -5), topic: readJson(`content/subtopics/${f}`).topic as string }));
const usedSubs = new Set(
  fs.readdirSync(dir).filter((f) => f.endsWith(".md")).flatMap((f) => {
    const d = matter(fs.readFileSync(path.join(dir, f), "utf8")).data;
    return d.draft === true || d.status === "draft" || d.status === "review" ? [] : ((d.subtopics as string[]) ?? []);
  }),
);
const withPosts = subs.filter((s) => usedSubs.has(s.slug));
const byTopic = new Map<string, string[]>();
for (const s of withPosts) byTopic.set(s.topic, [...(byTopic.get(s.topic) ?? []), s.slug]);
const [bigTopic, bigSubs] = [...byTopic.entries()].sort((a, b) => b[1].length - a[1].length)[0];

test.describe("Chủ đề con", () => {
  test("trang chủ đề có khối chủ đề con: thẻ liên kết đúng, 5 thẻ cùng lúc ở 1440px, nút ‹ › trượt được", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/blog/${bigTopic}`);
    const region = page.getByRole("region", { name: "Danh sách chủ đề con" });
    await expect(region).toBeVisible();
    const links = region.getByRole("link");
    await expect(links).toHaveCount(bigSubs.length);
    await expect(links.first()).toHaveAttribute("href", new RegExp(`^/blog/${bigTopic}/`));
    const visible = await region.evaluate((t) => [...t.children].filter((c) => { const r = c.getBoundingClientRect(), tr = t.getBoundingClientRect(); return r.left >= tr.left - 2 && r.right <= tr.right + 2; }).length);
    expect(visible).toBe(Math.min(5, bigSubs.length));
    if (bigSubs.length > 5) {
      const next = page.getByRole("button", { name: "Sau" });
      await expect(page.getByRole("button", { name: "Trước" })).toBeDisabled();
      await next.click();
      await expect(page.getByRole("button", { name: "Trước" })).toBeEnabled();
    }
  });

  test("trang chủ đề con: 200, canonical, tiêu đề, danh sách bài riêng, nút quay về cả chủ đề; sitemap có địa chỉ", async ({ page, request }) => {
    const slug = bigSubs[0];
    const res = await page.goto(`/blog/${bigTopic}/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/blog/${bigTopic}/${slug}$`));
    await expect(page.locator("#post-list-title")).toContainText("Bài viết trong");
    await expect(page.getByRole("link", { name: "Tất cả bài trong chủ đề" })).toHaveAttribute("href", `/blog/${bigTopic}`);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(`/blog/${bigTopic}/${slug}`);
  });

  test("địa chỉ sai bị 404: chủ đề cha sai, đoạn 'trang' không kèm số", async ({ request }) => {
    const other = [...byTopic.keys()].find((t) => t !== bigTopic);
    if (other) expect((await request.get(`/blog/${other}/${bigSubs[0]}`)).status()).toBe(404);
    expect((await request.get(`/blog/${bigTopic}/trang`)).status()).toBe(404);
  });
});
