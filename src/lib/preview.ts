// Cổng bảo vệ trang XEM TRƯỚC bài nháp (/xem-truoc/...). Chỉ cho chạy khi Keystatic ở chế độ LOCAL và không chạy trên Vercel:
// nghĩa là chỉ trên máy của người đang soạn bài. Trang này hiện cả bài nháp / bài lên lịch nên KHÔNG được lộ ra internet.
// Chế độ GitHub (production): xem trước làm ở bước deploy (cần đăng nhập Keystatic để xác thực), tới lúc đó trang này trả 404.
export const isPreviewEnabled = () =>
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE !== "github" && !process.env.VERCEL;
