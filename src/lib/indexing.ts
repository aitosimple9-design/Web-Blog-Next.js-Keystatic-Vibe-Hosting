// Có cho công cụ tìm kiếm lập chỉ mục site này không? CHỈ bản production thật mới được.
// Bản xem trước (preview) của Vercel, bản chạy ở máy, hay bất kỳ môi trường nào khác đều bị chặn để URL tạm không lọt vào Google.
//  - Vercel: biến VERCEL_ENV do Vercel tự đặt ("production" | "preview" | "development"); chỉ "production" được lập chỉ mục.
//  - Nơi khác (không có VERCEL_ENV): mặc định CHẶN; muốn cho phép thì đặt biến môi trường ALLOW_INDEXING=true ở bản production.
// Hàm thuần (nhận env làm tham số) để test được; next.config.ts không import được alias `@/` nên lặp lại đúng điều kiện này ở đó (test chặn lệch).

export function isIndexable(env: Record<string, string | undefined> = process.env): boolean {
  if (env.VERCEL_ENV) return env.VERCEL_ENV === "production";
  return env.ALLOW_INDEXING === "true";
}
