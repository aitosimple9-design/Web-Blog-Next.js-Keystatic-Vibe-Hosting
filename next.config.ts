import type { NextConfig } from "next";
import { buildRedirects, readRedirectFiles } from "./src/shared/redirects";
import { checkSiteUrl } from "./src/shared/site-url-check";

// Giống `isIndexable()` ở src/lib/indexing.ts (file này không import được alias `@/`; tests/unit/indexing.test.ts chặn lệch):
// chỉ production thật mới được lập chỉ mục. Ngoài ra thêm header X-Robots-Tag cho MỌI đường dẫn (kể cả ảnh, file tĩnh) ở các môi trường khác.
const indexable = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.ALLOW_INDEXING === "true";

// Build production thật mà NEXT_PUBLIC_SITE_URL để trống / là localhost / sai dạng thì DỪNG build: bản đó không lên mạng, web đang chạy giữ nguyên.
// Máy cá nhân và bản preview không bị chặn (xem src/shared/site-url-check.ts).
const siteUrl = checkSiteUrl();
if (siteUrl.level === "error") throw new Error(`[NEXT_PUBLIC_SITE_URL] ${siteUrl.message}`);

const nextConfig: NextConfig = {
  // Thư mục build riêng cho server dev của E2E trang quản trị (tránh đụng server dev đang chạy của máy); bình thường vẫn là .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Chỉ ảnh hưởng khi chạy `npm run dev`: đưa nút "N" của Next.js sang góc phải để không đè lên icon mạng xã hội ở góc dưới trái Hero
  devIndicators: { position: "bottom-right" },
  // Keystatic ở GitHub mode tự chuyển localhost sang 127.0.0.1; Next 16 chặn địa chỉ này trong dev nên trang quản trị trắng
  // (Thinkmill/keystatic#1549). Chỉ có tác dụng khi chạy `npm run dev`.
  allowedDevOrigins: ["127.0.0.1"],
  // Chuyển hướng do Keystatic quản lý (content/redirects/*.json, menu "Chuyển hướng"); đọc lúc build / khởi động server.
  // Sửa chuyển hướng khi đang `npm run dev` thì khởi động lại dev. buildRedirects() tự bỏ mục sai để build không bao giờ sập.
  async redirects() {
    return buildRedirects(readRedirectFiles());
  },
  // Các API / trang quản trị đọc content/ lúc chạy (điểm SEO, tên sách, chuyển hướng nhanh, xem trước): bảo đảm thư mục content/ có trong gói
  // của chúng trên Vercel (Next chỉ tự gom file mà nó nhìn thấy được đường dẫn tĩnh).
  outputFileTracingIncludes: {
    "/api/diem-seo": ["./content/**/*"],
    "/api/ten-sach": ["./content/**/*"],
    "/api/chuyen-huong": ["./content/**/*"],
    "/xem-truoc/bai-viet/[slug]": ["./content/**/*"],
  },
  async headers() {
    return indexable ? [] : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
