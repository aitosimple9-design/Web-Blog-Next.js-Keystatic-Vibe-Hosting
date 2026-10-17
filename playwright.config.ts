import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    // Máy chủ E2E chạy như production để robots.txt / sitemap có đủ nội dung. Môi trường khác production mặc định bị chặn lập chỉ mục
    // (src/lib/indexing.ts); phần chặn đó đã có test đơn vị (tests/unit/indexing.test.ts, seo.test.ts).
    env: { ALLOW_INDEXING: "true" },
    timeout: 300_000,
  },
});
