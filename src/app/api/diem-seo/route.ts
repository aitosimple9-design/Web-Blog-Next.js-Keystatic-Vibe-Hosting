import { NextResponse } from "next/server";
import { getSeoResultBySlug, getSeoScoresBySlug } from "@/lib/posts";
import { isAdminRequest } from "@/lib/admin-access";

// Cấp điểm SEO của mọi bài cho cột "SEO" ở danh sách quản trị Keystatic (src/app/keystatic/KeystaticThumbnails.tsx).
// Gồm cả bài nháp nên chỉ quản trị viên được gọi (src/lib/admin-access.ts: máy local, hoặc người đã đăng nhập Keystatic bằng GitHub và có quyền ghi vào repo), còn lại 404.
// Chế độ GitHub: chấm theo bản đã build (mới sau mỗi lần merge); hộp điểm trong form vẫn chấm nội dung đang gõ.
export const dynamic = "force-dynamic";

// GET /api/diem-seo            → điểm của mọi bài {slug: {score, level}} (cột "Điểm SEO")
// GET /api/diem-seo?slug=<slug> → kết quả chấm đầy đủ của bản đã lưu (hộp điểm trong form dùng để tự đối chiếu); 404 nếu chưa có bài
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return new NextResponse(null, { status: 404 });
  const headers = { "Cache-Control": "no-store" };
  const slug = new URL(request.url).searchParams.get("slug");
  if (slug === null) return NextResponse.json(getSeoScoresBySlug(), { headers });
  const result = getSeoResultBySlug(slug);
  return result ? NextResponse.json(result, { headers }) : new NextResponse(null, { status: 404, headers });
}
