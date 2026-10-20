import { NextResponse } from "next/server";
import { getSeoResultBySlug, getSeoResultFromRaw, getSeoScoresBySlug } from "@/shared/content/posts";
import { adminToken, isAdminRequest } from "@/cms/lib/admin-access";
import { fetchPostRaw, validBranch } from "@/cms/lib/github-content";

// Cấp điểm SEO của mọi bài cho cột "SEO" ở danh sách quản trị Keystatic (src/app/keystatic/KeystaticThumbnails.tsx).
// Gồm cả bài nháp nên chỉ quản trị viên được gọi (src/lib/admin-access.ts: máy local, hoặc người đã đăng nhập Keystatic bằng GitHub và có quyền ghi vào repo), còn lại 404.
// Chế độ GitHub: chấm theo bản đã build (mới sau mỗi lần merge); hộp điểm trong form vẫn chấm nội dung đang gõ.
export const dynamic = "force-dynamic";

// GET /api/diem-seo            → điểm của mọi bài {slug: {score, level}} (cột "Điểm SEO")
// GET /api/diem-seo?slug=<slug> → kết quả chấm đầy đủ của bản đã lưu (hộp điểm trong form dùng để tự đối chiếu); 404 nếu chưa có bài
// GET /api/diem-seo?slug=<slug>&branch=<nhánh> → như trên nhưng chế độ GitHub đọc bản đã lưu Ở NHÁNH đang soạn (bằng token của chính người gọi), không phải bản build
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return new NextResponse(null, { status: 404 });
  const headers = { "Cache-Control": "no-store" };
  const params = new URL(request.url).searchParams;
  const slug = params.get("slug");
  if (slug === null) return NextResponse.json(getSeoScoresBySlug(), { headers });
  const branch = params.get("branch");
  if (branch !== null && validBranch(branch)) {
    const token = await adminToken(request);
    if (token) {
      try {
        const raw = await fetchPostRaw(token, branch, slug);
        const fromBranch = raw === null ? null : getSeoResultFromRaw(slug, raw);
        if (fromBranch) return NextResponse.json(fromBranch, { headers });
      } catch {
        // GitHub trục trặc: rơi về bản build
      }
    }
  }
  const result = getSeoResultBySlug(slug);
  return result ? NextResponse.json(result, { headers }) : new NextResponse(null, { status: 404, headers });
}
