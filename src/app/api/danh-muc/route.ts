import { NextResponse } from "next/server";
import { adminToken, isAdminRequest } from "@/cms/lib/admin-access";
import { createEntryLocal, isEntryKind, listEntries, planEntry, type EntryItem, type EntryKind } from "@/cms/lib/entry-store";
import { friendlyGithubError, listEntriesGitHub, putEntryGitHub, validBranch } from "@/cms/lib/github-content";

// Cấp danh sách Sách / Chủ đề / Chủ đề con (GET) và tạo nhanh một mục (POST) cho ô chọn trong form bài (src/cms/ui/EntryPicker.tsx).
// Chỉ quản trị viên (src/cms/lib/admin-access.ts); còn lại 404. Chế độ local: ghi file ở máy. Chế độ GitHub: đọc / commit ở NHÁNH đang soạn bằng
// token của chính người đó (nhánh chính được bảo vệ thì GitHub từ chối và ta báo tạo nhánh mới), giống /api/chuyen-huong.
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const notFound = () => new NextResponse(null, { status: 404 });

async function listFor(kind: EntryKind, token: string | null, branch: string | null): Promise<EntryItem[]> {
  if (token && branch) {
    try {
      return await listEntriesGitHub(token, branch, kind);
    } catch {
      /* GitHub trục trặc: dùng bản build */
    }
  }
  return listEntries(kind);
}

export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) return notFound();
  const params = new URL(req.url).searchParams;
  const kind = params.get("kind");
  if (!isEntryKind(kind)) return NextResponse.json({ ok: false, error: "Loại không hợp lệ." }, { status: 400, headers: noStore });
  const branch = params.get("branch");
  const token = branch && validBranch(branch) ? await adminToken(req) : null;
  return NextResponse.json(await listFor(kind, token, token ? branch : null), { headers: noStore });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) return notFound();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const kind = body?.kind;
  if (!isEntryKind(kind)) return NextResponse.json({ ok: false, error: "Loại không hợp lệ." }, { status: 400, headers: noStore });
  const input = { name: body?.name, description: body?.description, topic: body?.topic, order: body?.order };

  const token = await adminToken(req);
  if (!token) {
    const plan = createEntryLocal(kind, input);
    return NextResponse.json(plan.ok ? { ok: true, item: plan.item } : plan, { status: plan.ok ? 200 : 400, headers: noStore });
  }
  const branch = body?.branch;
  if (!validBranch(branch)) return NextResponse.json({ ok: false, error: "Thiếu hoặc sai tên nhánh." }, { status: 400, headers: noStore });
  try {
    const plan = planEntry(kind, input, await listEntriesGitHub(token, branch, kind), kind === "subtopics" ? await listEntriesGitHub(token, branch, "topics") : []);
    if (!plan.ok) return NextResponse.json(plan, { status: 400, headers: noStore });
    await putEntryGitHub(token, branch, kind, plan);
    return NextResponse.json({ ok: true, item: plan.item }, { headers: noStore });
  } catch (e) {
    return NextResponse.json({ ok: false, error: friendlyGithubError(e) }, { status: 502, headers: noStore });
  }
}
