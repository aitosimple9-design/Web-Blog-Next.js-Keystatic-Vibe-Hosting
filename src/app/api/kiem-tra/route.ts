import { NextResponse } from "next/server";
import { adminToken, isAdminRequest } from "@/cms/lib/admin-access";
import { findOrphanImages } from "@/cms/lib/content-cleanup";
import { friendlyGithubError, readBranchContent, validBranch } from "@/cms/lib/github-content";
import { checkContent, memorySource, type CheckResult } from "@/shared/content-check";
import { fsSource, gitBase } from "@/shared/content-check-node";

// KIỂM TRA NỘI DUNG ngay trong trang quản trị: chạy CÙNG bộ luật với `npm run check-content` / CI (src/shared/content-check.ts).
// Chỉ quản trị viên (src/cms/lib/admin-access.ts); còn lại 404.
//   - Chế độ GitHub (?branch=<nhánh>, có token): đọc cả nhánh qua GitHub API bằng token của chính người đó; bản gốc để so slug = bản build
//     trên máy chủ (bản đã merge vào main). Không kiểm tra ảnh mồ côi (việc của npm run prune-images).
//   - Chế độ local (máy soạn bài): đọc thẳng thư mục dự án; bản gốc = nhánh main qua git (nếu có); có kiểm tra ảnh mồ côi.
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export type KiemTraResponse =
  | { ok: true; mode: "github" | "local"; branch: string | null; base: string | null; ms: number; result: CheckResult }
  | { ok: false; error: string };

export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) return new NextResponse(null, { status: 404 });
  const started = Date.now();
  const root = process.cwd();
  const branch = new URL(req.url).searchParams.get("branch");
  const token = branch && validBranch(branch) ? await adminToken(req) : null;

  if (token && branch) {
    try {
      const content = await readBranchContent(token, branch);
      const result = checkContent(memorySource(content.paths, content.texts), { base: { label: "main (bản đã đăng)", ...fsSource(root) } });
      if (content.truncated) result.infos.unshift("Nhánh có quá nhiều file, GitHub chỉ trả một phần cây file: kết quả có thể thiếu.");
      return NextResponse.json({ ok: true, mode: "github", branch, base: "main (bản đã đăng)", ms: Date.now() - started, result } satisfies KiemTraResponse, { headers: noStore });
    } catch (e) {
      return NextResponse.json({ ok: false, error: friendlyGithubError(e) } satisfies KiemTraResponse, { status: 502, headers: noStore });
    }
  }

  // Web thật (Vercel) không có thư mục public/ và git trong hàm máy chủ: phải có nhánh để đọc từ GitHub
  if (process.env.VERCEL) return NextResponse.json({ ok: false, error: "Thiếu hoặc sai tên nhánh." } satisfies KiemTraResponse, { status: 400, headers: noStore });

  const { base } = gitBase(root, "main", { explicit: true });
  let orphanImages: ReturnType<typeof findOrphanImages> = [];
  try {
    orphanImages = findOrphanImages(root);
  } catch {
    /* không đọc được thư mục ảnh: bỏ qua */
  }
  const result = checkContent(fsSource(root), { base, orphanImages });
  return NextResponse.json({ ok: true, mode: "local", branch: null, base: base?.label ?? null, ms: Date.now() - started, result } satisfies KiemTraResponse, { headers: noStore });
}
