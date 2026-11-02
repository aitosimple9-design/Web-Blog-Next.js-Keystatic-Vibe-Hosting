// Cổng "chế độ LOCAL" cho các API / trang dành riêng người quản trị (xem trước bài nháp, điểm SEO, tạo nhanh mục, chuyển hướng...).
// Chỉ mở khi Keystatic ở chế độ local, KHÔNG chạy trên Vercel, VÀ đang chạy `next dev` (NODE_ENV=development): nghĩa là chỉ trên máy của người
// đang soạn bài. Rà soát 2026-11-02: trước đây chỉ xét "không phải Vercel", nên bản build production (`next start`) chạy ở nơi khác Vercel
// (vd. Vibe Host của Mắt Bão) mà thiếu NEXT_PUBLIC_KEYSTATIC_STORAGE=github sẽ mở mọi API, kể cả API ghi file, cho cả internet.
// Chế độ GitHub (web thật): xác thực bằng đăng nhập GitHub ở src/cms/lib/admin-access.ts, cổng này luôn đóng.
export const isPreviewEnabled = () =>
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE !== "github" && !process.env.VERCEL && process.env.NODE_ENV === "development";
