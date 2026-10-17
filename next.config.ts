import type { NextConfig } from "next";

// Giống `isIndexable()` ở src/lib/indexing.ts (file này không import được alias `@/`; tests/unit/indexing.test.ts chặn lệch):
// chỉ production thật mới được lập chỉ mục. Ngoài ra thêm header X-Robots-Tag cho MỌI đường dẫn (kể cả ảnh, file tĩnh) ở các môi trường khác.
const indexable = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.ALLOW_INDEXING === "true";

const nextConfig: NextConfig = {
  // Chỉ ảnh hưởng khi chạy `npm run dev`: đưa nút "N" của Next.js sang góc phải để không đè lên icon mạng xã hội ở góc dưới trái Hero
  devIndicators: { position: "bottom-right" },
  // Keystatic ở GitHub mode tự chuyển localhost sang 127.0.0.1; Next 16 chặn địa chỉ này trong dev nên trang quản trị trắng
  // (Thinkmill/keystatic#1549). Chỉ có tác dụng khi chạy `npm run dev`.
  allowedDevOrigins: ["127.0.0.1"],
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
