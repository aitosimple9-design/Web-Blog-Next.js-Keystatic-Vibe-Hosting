import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chỉ ảnh hưởng khi chạy `npm run dev`: đưa nút "N" của Next.js sang góc phải để không đè lên icon mạng xã hội ở góc dưới trái Hero
  devIndicators: { position: "bottom-right" },
  // Keystatic ở GitHub mode tự chuyển localhost sang 127.0.0.1; Next 16 chặn địa chỉ này trong dev nên trang quản trị trắng
  // (Thinkmill/keystatic#1549). Chỉ có tác dụng khi chạy `npm run dev`.
  allowedDevOrigins: ["127.0.0.1"],
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
