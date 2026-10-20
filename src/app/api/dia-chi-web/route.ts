import { NextResponse } from "next/server";
import { isAdminRequest } from "@/cms/lib/admin-access";
import { checkSiteUrl } from "@/shared/site-url-check";

// Cấp kết quả kiểm tra NEXT_PUBLIC_SITE_URL cho dải thông báo ở trang quản trị (src/cms/ui/KeystaticSiteUrlBanner.tsx).
// Cùng cổng quản trị viên với /api/diem-seo; người khác nhận 404.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return new NextResponse(null, { status: 404 });
  // Viết đúng dạng `process.env.NEXT_PUBLIC_SITE_URL` để lấy ĐÚNG giá trị đã nhúng lúc build, tức giá trị mà sitemap / canonical đang dùng
  const status = checkSiteUrl({ ...process.env, NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL });
  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
