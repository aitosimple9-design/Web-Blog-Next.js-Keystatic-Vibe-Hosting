import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chỉ ảnh hưởng khi chạy `npm run dev`: đưa nút "N" của Next.js sang góc phải để không đè lên icon mạng xã hội ở góc dưới trái Hero
  devIndicators: { position: "bottom-right" },
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
