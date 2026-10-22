import { NextResponse } from "next/server";
import { getAdminStats } from "@/shared/content/admin-stats";
import { isAdminRequest } from "@/cms/lib/admin-access";

// Cấp số liệu cho các cột của danh sách quản trị Keystatic: số chủ đề con, số bài của chủ đề / chủ đề con, tên chủ đề và chủ đề con của từng bài
// (src/cms/ui/KeystaticThumbnails.tsx). Gồm cả bài nháp nên chỉ quản trị viên được gọi (src/cms/lib/admin-access.ts), còn lại 404.
// Chế độ GitHub: đọc từ bản đã build (mới sau mỗi lần merge), giống /api/ten-sach.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return new NextResponse(null, { status: 404 });
  return NextResponse.json(getAdminStats(), { headers: { "Cache-Control": "no-store" } });
}
