// Kiểm tra NEXT_PUBLIC_SITE_URL (địa chỉ chính thức của web: sitemap, canonical, ảnh chia sẻ, JSON-LD đều dùng nó).
// Hàm thuần, KHÔNG import alias `@/` vì next.config.ts và scripts/check-content.mjs cũng dùng; dùng chung cho 3 nơi:
// chặn build production (next.config.ts), `npm run check-content`, và dải thông báo ở trang quản trị (/api/dia-chi-web).
// Chỉ bản production THẬT mới bị coi là lỗi (cùng điều kiện với src/frontend/lib/indexing.ts); máy cá nhân và bản preview dùng localhost là bình thường.
export type SiteUrlLevel = "ok" | "warn" | "error" | "dev";
export type SiteUrlStatus = { level: SiteUrlLevel; url: string; message: string };

type Env = Record<string, string | undefined>;

export const isProductionEnv = (env: Env = process.env): boolean =>
  env.VERCEL_ENV ? env.VERCEL_ENV === "production" : env.ALLOW_INDEXING === "true";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);
const FIX = "Vào Vercel → Settings → Environment Variables, đặt NEXT_PUBLIC_SITE_URL = địa chỉ web thật (https://..., không có dấu / ở cuối), rồi Redeploy.";

export function checkSiteUrl(env: Env = process.env): SiteUrlStatus {
  const url = (env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!isProductionEnv(env)) {
    return { level: "dev", url, message: `Không phải production: ${url || "http://localhost:3000"} (dùng localhost ở đây là bình thường).` };
  }
  const bad = (message: string): SiteUrlStatus => ({ level: "error", url, message: `${message} ${FIX}` });
  if (!url) return bad("NEXT_PUBLIC_SITE_URL đang để trống, sitemap và ảnh chia sẻ sẽ trỏ về http://localhost:3000.");
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return bad(`NEXT_PUBLIC_SITE_URL "${url}" không phải địa chỉ hợp lệ.`);
  }
  if (LOCAL_HOSTS.has(parsed.hostname)) return bad(`NEXT_PUBLIC_SITE_URL đang là ${url} (địa chỉ máy cá nhân).`);
  if (parsed.protocol !== "https:") return bad(`NEXT_PUBLIC_SITE_URL "${url}" phải bắt đầu bằng https://.`);
  if (url.endsWith("/")) return bad(`NEXT_PUBLIC_SITE_URL "${url}" không được có dấu / ở cuối.`);
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) return bad(`NEXT_PUBLIC_SITE_URL "${url}" chỉ gồm https://tên-miền, không có đường dẫn.`);
  if (parsed.hostname.endsWith(".vercel.app")) {
    return { level: "warn", url, message: `Đang dùng địa chỉ tạm ${url}. Khi gắn tên miền thật, đổi NEXT_PUBLIC_SITE_URL rồi Redeploy.` };
  }
  return { level: "ok", url, message: `Địa chỉ web: ${url}` };
}
