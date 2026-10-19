import { NextResponse } from "next/server";
import { adminToken, isAdminRequest } from "@/cms/lib/admin-access";
import { applyPlanGitHub, friendlyGithubError, listRedirectsGitHub, validBranch } from "@/cms/lib/github-content";
import { createRedirect, listExisting, listItems, planRedirect, slugStatus, toExisting } from "@/cms/lib/redirect-tools";
import { KIND_PREFIX, type RedirectKind } from "@/shared/redirect-patterns";

// Cấp danh sách mục (GET) và tạo chuyển hướng nhanh (POST) cho trang quản trị Keystatic (src/app/keystatic/KeystaticRedirectTools.tsx).
// Chỉ quản trị viên (src/lib/admin-access.ts): máy local, hoặc người đã đăng nhập Keystatic bằng GitHub và có quyền ghi vào repo; còn lại 404.
// Chế độ local: ghi file ở máy. Chế độ GitHub (web thật không ghi được file): commit vào NHÁNH đang soạn (`branch`) bằng token của chính người đó;
// nhánh chính được bảo vệ thì GitHub từ chối và ta báo người dùng tạo nhánh mới.
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const notFound = () => new NextResponse(null, { status: 404 });

export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) return notFound();
  const params = new URL(req.url).searchParams;
  const branch = params.get("branch");
  const token = branch && validBranch(branch) ? await adminToken(req) : null;
  const kind = params.get("kind") ?? "";
  try {
    if (params.has("existing")) {
      return NextResponse.json(token && branch ? toExisting(await listRedirectsGitHub(token, branch)) : listExisting(), { headers: noStore });
    }
    if (params.has("slug")) {
      const status = slugStatus(kind, params.get("slug") ?? "");
      const prefix = KIND_PREFIX[kind as RedirectKind];
      if (token && branch && prefix && !status.hasRedirect) {
        // web thật: bản build có thể chưa có chuyển hướng vừa tạo ở nhánh đang soạn
        const onBranch = toExisting(await listRedirectsGitHub(token, branch)).some((e) => e.from === prefix + (params.get("slug") ?? ""));
        if (onBranch) return NextResponse.json({ ...status, hasRedirect: true, needsRedirect: false }, { headers: noStore });
      }
      return NextResponse.json(status, { headers: noStore });
    }
  } catch {
    // GitHub trục trặc: trả theo bản build, không làm hỏng trang quản trị
    if (params.has("existing")) return NextResponse.json(listExisting(), { headers: noStore });
    return NextResponse.json(slugStatus(kind, params.get("slug") ?? ""), { headers: noStore });
  }
  return NextResponse.json(listItems(kind), { headers: noStore });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) return notFound();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const s = (k: string) => (typeof body?.[k] === "string" ? (body[k] as string) : undefined);
  const input = { kind: s("kind") ?? "", oldSlug: s("oldSlug"), newSlug: s("newSlug"), from: s("from"), to: s("to"), label: s("label") };

  const token = await adminToken(req);
  if (!token) {
    // chế độ local: ghi file ở máy
    const result = createRedirect(input);
    return NextResponse.json(result, { status: result.ok ? 200 : 400, headers: noStore });
  }
  const branch = s("branch");
  if (!validBranch(branch)) return NextResponse.json({ ok: false, error: "Thiếu hoặc sai tên nhánh." }, { status: 400, headers: noStore });
  try {
    const existing = await listRedirectsGitHub(token, branch);
    const plan = planRedirect(input, existing);
    if (!plan.ok) return NextResponse.json(plan, { status: 400, headers: noStore });
    await applyPlanGitHub(token, branch, plan, existing);
    return NextResponse.json(
      { ok: true, from: plan.from, to: plan.to, file: plan.file, flattened: plan.flattened, removed: plan.removed, branch },
      { headers: noStore },
    );
  } catch (e) {
    return NextResponse.json({ ok: false, error: friendlyGithubError(e) }, { status: 502, headers: noStore });
  }
}

