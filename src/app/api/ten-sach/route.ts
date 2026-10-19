import { NextResponse } from "next/server";
import { getBookNamesBySlug } from "@/lib/posts";
import { isAdminRequest } from "@/lib/admin-access";

// Cấp tên sách của mọi bài cho cột "Nguồn sách" ở danh sách quản trị Keystatic (src/app/keystatic/KeystaticThumbnails.tsx).
// Gồm cả bài nháp nên chỉ quản trị viên được gọi (src/lib/admin-access.ts: máy local, hoặc người đã đăng nhập Keystatic bằng GitHub và có quyền ghi vào repo), còn lại 404.
// Chế độ GitHub: đọc từ bản đã build (mới sau mỗi lần merge).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return new NextResponse(null, { status: 404 });
  return NextResponse.json(getBookNamesBySlug(), { headers: { "Cache-Control": "no-store" } });
}
