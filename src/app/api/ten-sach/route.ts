import { NextResponse } from "next/server";
import { getBookNamesBySlug } from "@/lib/posts";
import { isPreviewEnabled } from "@/lib/preview";

// Cấp tên sách của mọi bài cho cột "Nguồn sách" ở danh sách quản trị Keystatic (src/app/keystatic/KeystaticThumbnails.tsx).
// Gồm cả bài nháp nên cùng cổng với trang xem trước: chỉ chạy ở máy soạn bài (chế độ local, không VERCEL), còn lại 404.
export const dynamic = "force-dynamic";

export function GET() {
  if (!isPreviewEnabled()) return new NextResponse(null, { status: 404 });
  return NextResponse.json(getBookNamesBySlug(), { headers: { "Cache-Control": "no-store" } });
}
