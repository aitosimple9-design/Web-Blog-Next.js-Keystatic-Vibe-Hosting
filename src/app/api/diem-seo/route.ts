import { NextResponse } from "next/server";
import { getSeoScoresBySlug } from "@/lib/posts";
import { isPreviewEnabled } from "@/lib/preview";

// Cấp điểm SEO của mọi bài cho cột "SEO" ở danh sách quản trị Keystatic (src/app/keystatic/KeystaticThumbnails.tsx).
// Gồm cả bài nháp nên cùng cổng với trang xem trước: chỉ chạy ở máy soạn bài (chế độ local, không VERCEL), còn lại 404.
export const dynamic = "force-dynamic";

export function GET() {
  if (!isPreviewEnabled()) return new NextResponse(null, { status: 404 });
  return NextResponse.json(getSeoScoresBySlug(), { headers: { "Cache-Control": "no-store" } });
}
