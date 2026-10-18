import { NextResponse } from "next/server";
import { createRedirect, listItems } from "@/lib/redirect-tools";
import { isPreviewEnabled } from "@/lib/preview";

// Cấp danh sách mục (GET) và tạo chuyển hướng nhanh (POST) cho trang quản trị Keystatic (src/app/keystatic/KeystaticRedirectTools.tsx).
// GHI file nên cùng cổng với trang xem trước: chỉ chạy ở máy soạn bài (chế độ local, không VERCEL), còn lại 404.
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export function GET(req: Request) {
  if (!isPreviewEnabled()) return new NextResponse(null, { status: 404 });
  const kind = new URL(req.url).searchParams.get("kind") ?? "";
  return NextResponse.json(listItems(kind), { headers: noStore });
}

export async function POST(req: Request) {
  if (!isPreviewEnabled()) return new NextResponse(null, { status: 404 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const s = (k: string) => (typeof body?.[k] === "string" ? (body[k] as string) : undefined);
  const result = createRedirect({ kind: s("kind") ?? "", oldSlug: s("oldSlug"), newSlug: s("newSlug"), from: s("from"), to: s("to"), label: s("label") });
  return NextResponse.json(result, { status: result.ok ? 200 : 400, headers: noStore });
}
