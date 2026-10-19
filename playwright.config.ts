import { defineConfig, devices } from "@playwright/test";

const PORT = 3100; // web công khai: build + start như production
const ADMIN_PORT = 3200; // trang quản trị: next dev, Keystatic chế độ local

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { trace: "retain-on-failure" },
  projects: [
    // tests/e2e/public/: các trang công khai, SEO, chuyển hướng
    { name: "chromium", testDir: "tests/e2e/public", use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${PORT}` } },
    // tests/e2e/admin/: trang quản trị Keystatic (CHỈ ĐỌC, không ghi vào content/)
    { name: "admin", testDir: "tests/e2e/admin", use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${ADMIN_PORT}` } },
  ],
  webServer: [
    {
      command: `npm run build && npm run start -- -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      // Máy chủ E2E chạy như production để robots.txt / sitemap có đủ nội dung. Môi trường khác production mặc định bị chặn lập chỉ mục
      // (src/frontend/lib/indexing.ts); phần chặn đó đã có test đơn vị (tests/unit/frontend/indexing.test.ts, tests/unit/app/seo.test.ts).
      env: { ALLOW_INDEXING: "true" },
      timeout: 300_000,
    },
    {
      // Trang quản trị chỉ chạy ở chế độ dev + local (isAdminRequest: máy không có VERCEL). Ép storage=local để .env.local của máy không làm lệch.
      command: `npm run dev -- -p ${ADMIN_PORT}`,
      url: `http://localhost:${ADMIN_PORT}/keystatic`,
      reuseExistingServer: !process.env.CI,
      // NEXT_DIST_DIR: Next chỉ cho MỘT server dev mỗi thư mục build, nên dùng thư mục riêng để chạy song song với `npm run dev` của máy.
      env: { NEXT_PUBLIC_KEYSTATIC_STORAGE: "local", NEXT_DIST_DIR: ".next-e2e" },
      timeout: 300_000,
    },
  ],
});
