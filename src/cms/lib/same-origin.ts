// Chặn lệnh GHI (POST) gửi từ trang web khác (CSRF: trang lạ lợi dụng trình duyệt của người quản trị để gửi lệnh).
// Chế độ GitHub đã có cookie SameSite=Lax của Keystatic, nhưng chế độ local KHÔNG cần cookie: khi đang chạy `npm run dev`, một trang lạ mở trong
// cùng trình duyệt có thể POST tới http://localhost:3000/api/... để ghi file vào content/ (rà soát 2026-11-02). Trang quản trị thật luôn gửi
// từ chính nó nên không bị ảnh hưởng.
// Quy tắc: trình duyệt hiện đại gửi `Sec-Fetch-Site`; chỉ nhận "same-origin" (và "none": người dùng tự gõ / công cụ dòng lệnh).
// Không có header đó (trình duyệt cũ, curl) thì xét `Origin`: có thì phải trùng máy chủ đang nhận yêu cầu; không có Origin thì cho qua
// (không phải lệnh từ trang web khác, vì trình duyệt luôn gửi Origin với POST khác nguồn).
export function isSameOriginRequest(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin" || site === "none";
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host);
  } catch {
    return false;
  }
}
