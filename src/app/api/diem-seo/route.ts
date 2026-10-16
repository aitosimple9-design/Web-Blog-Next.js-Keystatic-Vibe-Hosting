import { NextResponse } from "next/server";
import { getSeoResultBySlug, getSeoScoresBySlug } from "@/lib/posts";
import { isPreviewEnabled } from "@/lib/preview";

// Cấp điểm SEO của mọi bài cho cột "SEO" ở danh sách quản trị Keystatic (src/app/keystatic/KeystaticThumbnails.tsx).
// Gồm cả bài nháp nên cùng cổng với trang xem trước: chỉ chạy ở máy soạn bài (chế độ local, không VERCEL), còn lại 404.
export const dynamic = "force-dynamic";

// GET /api/diem-seo            → điểm của mọi bài {slug: {score, level}} (cột "Điểm SEO")
// GET /api/diem-seo?slug=<slug> → kết quả chấm đầy đủ của bản đã lưu (hộp điểm trong form dùng để tự đối chiếu); 404 nếu chưa có bài
export function GET(request: Request) {
  if (!isPreviewEnabled()) return new NextResponse(null, { status: 404 });
  const headers = { "Cache-Control": "no-store" };
  const slug = new URL(request.url).searchParams.get("slug");
  if (slug === null) return NextResponse.json(getSeoScoresBySlug(), { headers });
  const result = getSeoResultBySlug(slug);
  return result ? NextResponse.json(result, { headers }) : new NextResponse(null, { status: 404, headers });
}
