import { NextResponse } from "next/server";
import { getAllPosts } from "@/shared/content/posts";
import { topicBySlug } from "@/shared/content/topics";

// Chỉ mục tìm kiếm của ô tìm kiếm trên thanh đầu trang: JSON TĨNH dựng lúc build (chỉ bài đã đăng), SearchBox tải MỘT lần khi người đọc bấm vào ô.
// Trước đây chỉ mục nằm trong HTML của MỌI trang (tăng theo số bài); tách ra để HTML nhẹ, tốt cho tốc độ khi blog có hàng trăm bài (2026-10-22).
// Không phải trang để lập chỉ mục: có X-Robots-Tag noindex.
export const dynamic = "force-static";

export function GET() {
  const items = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    topic: topicBySlug(p.category)?.name ?? p.category,
    book: p.source.book,
  }));
  return NextResponse.json(items, {
    headers: { "X-Robots-Tag": "noindex", "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
