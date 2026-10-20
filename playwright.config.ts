import { defineConfig, devices } from "@playwright/test";

const PORT = 3100; // web công khai: build + start như production
const ADMIN_PORT = 3200; // trang quản trị: next dev, Keystatic chế độ local
const GITHUB_PORT = 3201; // trang quản trị: next dev, Keystatic chế độ GitHub nói chuyện với máy chủ GitHub GIẢ
const MOCK_PORT = 3300; // máy chủ GitHub giả (tests/e2e/admin-github/mock-github.mjs)

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
    { name: "admin", testDir: "tests/e2e/admin", timeout: 90_000, use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${ADMIN_PORT}` } },
    // tests/e2e/admin-github/: đường GitHub của trang quản trị (xác minh quyền, ghi chuyển hướng vào nhánh, xem trước / chấm SEO từ nhánh). Các test dùng chung một máy chủ giả có trạng thái nên chạy lần lượt
    { name: "admin-github", testDir: "tests/e2e/admin-github", fullyParallel: false, timeout: 90_000, use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${GITHUB_PORT}` } },
  ],
  webServer: [
    {
      command: `npm run build && npm run start -- -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      // Máy chủ E2E chạy như production để robots.txt / sitemap có đủ nội dung. Môi trường khác production mặc định bị chặn lập chỉ mục
      // (src/frontend/lib/indexing.ts); phần chặn đó đã có test đơn vị (tests/unit/frontend/indexing.test.ts, tests/unit/app/seo.test.ts).
      // Chạy như production nên next.config.ts đòi NEXT_PUBLIC_SITE_URL hợp lệ (https, không phải localhost): đặt địa chỉ giả cho test.
      env: { ALLOW_INDEXING: "true", NEXT_PUBLIC_SITE_URL: "https://e2e.example.com" },
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
    {
      command: `node tests/e2e/admin-github/mock-github.mjs ${MOCK_PORT}`,
      url: `http://localhost:${MOCK_PORT}/health`,
      reuseExistingServer: !process.env.CI,
    },
    {
      // Chế độ GitHub nhưng GitHub API là máy chủ giả. Thư mục build riêng (.next-e2e-github) vì Next chỉ cho một server dev mỗi thư mục.
      command: `npm run dev -- -p ${GITHUB_PORT}`,
      url: `http://localhost:${GITHUB_PORT}/robots.txt`,
      reuseExistingServer: !process.env.CI,
      env: { NEXT_PUBLIC_KEYSTATIC_STORAGE: "github", GITHUB_API_URL: `http://localhost:${MOCK_PORT}`, NEXT_DIST_DIR: ".next-e2e-github" },
      timeout: 300_000,
    },
  ],
});
