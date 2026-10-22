import { expect, test, type Page } from "@playwright/test";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// E2E trang quản trị Keystatic. CHỈ ĐỌC: mở trang, bấm xem, không bấm Lưu / Tạo, không gõ vào form.
// Server: `npm run dev` chế độ local (playwright.config.ts, cổng 3200, thư mục build riêng .next-e2e).
// Lấy một bài thật từ content/posts để thử trang sửa (không viết cứng slug).
const postsDir = path.join(process.cwd(), "content", "posts");
const slug = fs.readdirSync(postsDir).find((f) => f.endsWith(".md"))!.replace(/\.md$/, "");

// Chụp trạng thái content/ và public/images trước khi chạy: test KHÔNG được làm đổi file nào.
const gitState = () => execSync("git status --porcelain -- content public/images", { encoding: "utf8" });
let before = "";
test.beforeAll(() => {
  before = gitState();
});
test.afterAll(() => {
  expect(gitState(), "E2E trang quản trị không được ghi vào content/ hay public/images/").toBe(before);
});

const MENU = [
  { href: "/keystatic/collection/posts", name: "Bài viết" },
  { href: "/keystatic/collection/topics", name: "Chủ đề" },
  { href: "/keystatic/collection/subtopics", name: "Chủ đề con" },
  { href: "/keystatic/collection/books", name: "Sách" },
  { href: "/keystatic/collection/redirects", name: "Chuyển hướng" },
  { href: "/keystatic/singleton/homePage", name: "Trang chủ" },
  { href: "/keystatic/singleton/bookPage", name: "Trang Book" },
  { href: "/keystatic/singleton/blogPage", name: "Trang Blog" },
  { href: "/keystatic/singleton/articlePage", name: "Trang bài viết" },
  { href: "/keystatic/singleton/notFoundPage", name: "Trang 404" },
  { href: "/keystatic/singleton/privacyPage", name: "Chính sách riêng tư" },
  { href: "/keystatic/singleton/contactPage", name: "Liên hệ" },
  { href: "/keystatic/singleton/siteSettings", name: "Cài đặt site" },
  { href: "/keystatic/singleton/headerSettings", name: "Header" },
  { href: "/keystatic/singleton/footerSettings", name: "Footer" },
  { href: "/keystatic/singleton/newsletterSettings", name: "Newsletter" },
  { href: "/keystatic/singleton/uiLabels", name: "Nhãn giao diện" },
];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test.describe("Menu trái", () => {
  test("có 3 nhóm, đủ mục, mỗi mục có icon", async ({ page }) => {
    await page.goto("/keystatic");
    const nav = page.getByRole("navigation");
    for (const group of ["Nội dung", "Trang", "Cài đặt"]) await expect(nav.getByRole("heading", { name: group })).toBeVisible();
    for (const item of MENU) {
      const link = nav.locator(`a[href="${item.href}"]`);
      await expect(link, item.name).toHaveCount(1);
      await expect(link.locator("[data-ks-nav-icon] svg"), `icon của ${item.name}`).toHaveCount(1);
    }
    await expect(nav.locator('a[href="/keystatic"] [data-ks-nav-icon] svg')).toHaveCount(1);
  });

  test("mở được từng mục, không lỗi JavaScript", async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    for (const item of MENU) {
      await page.goto(item.href);
      await expect(page.getByRole("main"), item.name).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText("Application error"), item.name).toHaveCount(0);
      await expect(page.getByText("This page could not be found"), item.name).toHaveCount(0);
    }
    expect(errors, errors.join("\n")).toEqual([]);
  });
});

test.describe("Trang cài đặt (singleton) dạng thẻ", () => {
  const SINGLETONS = MENU.filter((m) => m.href.includes("/singleton/"));

  test("mỗi ô là một thẻ có tiêu đề, nhãn gốc vẫn là tên truy cập của ô", async ({ page }) => {
    test.setTimeout(240_000);
    for (const item of SINGLETONS) {
      await page.goto(item.href);
      const cards = page.locator("[data-ks-card]");
      await expect(cards.first(), item.name).toBeVisible({ timeout: 30_000 });
      // thẻ có nhãn đều có tiêu đề không rỗng
      const heads = page.locator("[data-ks-card-head] > :first-child");
      expect(await heads.count(), `${item.name}: có thẻ có tiêu đề`).toBeGreaterThan(0);
      for (const t of await heads.allInnerTexts()) expect(t.trim(), `${item.name}: tiêu đề thẻ rỗng`).not.toBe("");
    }
  });

  test("Cài đặt site: tách nhãn dài thành tiêu đề + mô tả, ô nhập vẫn dùng được theo tên truy cập", async ({ page }) => {
    await page.goto("/keystatic/singleton/siteSettings");
    const card = page.locator("[data-ks-card]").first();
    await expect(card.locator("[data-ks-card-head] > :first-child")).toHaveText("Tên site", { timeout: 30_000 });
    await expect(card.locator("[data-ks-card-head] > :nth-child(2)")).toContainText("tiêu đề tab");
    await expect(page.getByRole("textbox", { name: /^Tên site/ })).toBeVisible();
  });
});

test.describe("Form Chủ đề / Sách / Chuyển hướng dạng thẻ; form Bài viết giữ nguyên", () => {
  for (const path of ["collection/topics/create", "collection/subtopics/create", "collection/books/create", "collection/redirects/create"]) {
    test(`${path}: dạng thẻ`, async ({ page }) => {
      await page.goto(`/keystatic/${path}`);
      await expect(page.locator("[data-ks-card]").first()).toBeVisible({ timeout: 30_000 });
      expect(await page.locator("[data-ks-card]").count()).toBeGreaterThan(1);
    });
  }

  test("form Bài viết KHÔNG bị vẽ dạng thẻ (hộp điểm SEO đọc form theo nhãn)", async ({ page }) => {
    await page.goto(`/keystatic/collection/posts/item/${slug}`);
    await expect(page.getByRole("textbox", { name: /^Slug/ })).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("[data-ks-card]")).toHaveCount(0);
    await expect(page.locator("[data-ks-sub-head]")).toHaveCount(0);
  });
});

test.describe("Danh sách Bài viết", () => {
  test("có cột Điểm SEO, Ảnh bìa; tên sách không còn [object Object]", async ({ page }) => {
    await page.goto("/keystatic/collection/posts");
    await expect(page.getByRole("columnheader", { name: "Điểm SEO" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("columnheader", { name: "Ảnh bìa" })).toBeVisible();
    const row = page.getByRole("row").nth(1);
    await expect(row.getByText(/^\d+ · /), "ô điểm SEO có số và mức").toBeVisible({ timeout: 30_000 });
    await expect(row.locator("img").first(), "ảnh bìa thu nhỏ").toBeVisible();
    await expect(page.getByRole("grid").getByText("[object Object]", { exact: true })).toHaveCount(0);
  });
});

test.describe("Trang sửa Bài viết", () => {
  test("hộp điểm SEO, ô Slug bị khóa, nút Tạo chuyển hướng", async ({ page }) => {
    await page.goto(`/keystatic/collection/posts/item/${slug}`);
    // Hộp nổi mặc định thu gọn thành nút "Điểm SEO NN"; bấm để mở bảng chi tiết
    const widget = page.locator("[data-ks-seo-panel]:not([role=status])");
    await expect(widget).toBeVisible({ timeout: 30_000 });
    await expect(widget).toContainText(/\d+/);
    const panel = page.getByRole("region", { name: "Điểm SEO của bài" });
    if (!(await panel.isVisible())) await widget.getByRole("button").first().click();
    await expect(panel).toBeVisible();
    await expect(panel).toContainText(/\d+\/100/);
    await expect(page.locator("[data-ks-seo-panel][role=status]"), "hộp điểm báo không đọc được form").toHaveCount(0);

    const slugInput = page.getByRole("textbox", { name: /^Slug/ });
    await expect(slugInput).toHaveJSProperty("readOnly", true);
    const box = page.locator("[data-ks-redirect-box]");
    await expect(box).toBeVisible();
    await box.locator('[data-role="unlock"]').click();
    await expect(slugInput).toHaveJSProperty("readOnly", false);
    // Slug chưa đổi: nút Tạo chuyển hướng bị tắt
    await expect(box.locator('[data-role="create"]')).toBeDisabled();
    await expect(box.locator('[data-role="create"]')).toContainText("Slug chưa đổi");
  });
});

test.describe("Chuyển hướng", () => {
  test("nút Add mở hộp Thêm chuyển hướng: Loại → Mục", async ({ page }) => {
    await page.goto("/keystatic/collection/redirects");
    await page.getByRole("button", { name: "Add" }).click();
    const dialog = page.getByRole("dialog", { name: "Thêm chuyển hướng" });
    await expect(dialog).toBeVisible({ timeout: 30_000 });
    for (const kind of ["Bài viết", "Chủ đề", "Sách", "Khác"]) await expect(dialog.getByRole("option", { name: kind, exact: true })).toHaveCount(1);
    // Loại Bài viết: mục liệt kê bài thật
    await expect(dialog.getByRole("option", { name: new RegExp(`\\(${slug}\\)`) })).toHaveCount(1);
    // Đổi sang Chủ đề: danh sách mục đổi theo
    await dialog.getByLabel("Loại").selectOption({ label: "Chủ đề" });
    await expect(dialog.getByRole("option", { name: new RegExp(`\\(${slug}\\)`) })).toHaveCount(0);
  });
});

test.describe("API của trang quản trị (máy local)", () => {
  test("/api/diem-seo trả điểm của mọi bài", async ({ request }) => {
    const res = await request.get("/api/diem-seo");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data[slug]).toMatchObject({ score: expect.any(Number), level: expect.any(String) });
  });

  test("/api/diem-seo?slug= trả kết quả đầy đủ", async ({ request }) => {
    const res = await request.get(`/api/diem-seo?slug=${slug}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ score: expect.any(Number) });
  });

  test("/api/dia-chi-web trả kết quả kiểm tra NEXT_PUBLIC_SITE_URL; trang Cài đặt site hiện thẻ Địa chỉ web (máy local: mức bình thường)", async ({ request, page }) => {
    const res = await request.get("/api/dia-chi-web");
    expect(res.status()).toBe(200);
    expect((await res.json()).level).toBe("dev");
    await page.goto("/keystatic/singleton/siteSettings");
    const card = page.locator("[data-ks-site-url]");
    await expect(card).toHaveAttribute("data-ks-site-url", "dev", { timeout: 30_000 });
    await expect(card).toContainText("Địa chỉ web");
    await page.goto("/keystatic/collection/posts");
    await expect(page.locator("[data-ks-site-url]")).toHaveCount(0);
  });

  test("/api/ten-sach trả tên sách theo slug", async ({ request }) => {
    const res = await request.get("/api/ten-sach");
    expect(res.status()).toBe(200);
    expect(typeof (await res.json())[slug]).toBe("string");
  });

  test("/api/chuyen-huong liệt kê mục và báo trạng thái slug", async ({ request }) => {
    const list = await request.get(`/api/chuyen-huong?kind=${encodeURIComponent("Bài viết")}`);
    expect(list.status()).toBe(200);
    expect((await list.json()).some((i: { slug: string }) => i.slug === slug)).toBe(true);
    const status = await request.get(`/api/chuyen-huong?kind=${encodeURIComponent("Bài viết")}&slug=${slug}`);
    expect(status.status()).toBe(200);
    expect(await status.json()).toMatchObject({ hasRedirect: expect.any(Boolean), needsRedirect: expect.any(Boolean) });
    const existing = await request.get("/api/chuyen-huong?existing=1");
    expect(existing.status()).toBe(200);
    expect(Array.isArray(await existing.json())).toBe(true);
  });

  test("POST /api/chuyen-huong từ chối dữ liệu sai, không ghi file", async ({ request }) => {
    const res = await request.post("/api/chuyen-huong", { data: { kind: "Bài viết", oldSlug: "Sai Slug!", newSlug: "" } });
    expect(res.status()).toBe(400);
    expect((await res.json()).ok).toBe(false);
  });
});

test.describe("Xem trước", () => {
  test("bài thật mở được, noindex", async ({ request }) => {
    const res = await request.get(`/xem-truoc/bai-viet/${slug}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
  });

  test("slug không có thì 404", async ({ request }) => {
    expect((await request.get("/xem-truoc/bai-viet/khong-co-bai-nay")).status()).toBe(404);
  });
});
