import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";
import { imageFoldersToRemove, removeHomeReferences, removeImageFolders, removeOrphanImages } from "@/cms/lib/content-cleanup";
import { isPreviewEnabled } from "@/cms/lib/preview";
import { isSameOriginRequest } from "@/cms/lib/same-origin";

const handler = makeRouteHandler({ config });

// Bộ xử lý chế độ LOCAL của Keystatic đọc / ghi thẳng file và KHÔNG tự kiểm tra gì: chỉ cho chạy trên máy soạn bài (`next dev`, không Vercel),
// cùng cổng với các API quản trị khác (src/cms/lib/preview.ts). Chế độ GitHub do Keystatic xác thực bằng đăng nhập GitHub.
const localBlocked = () => config.storage.kind === "local" && !isPreviewEnabled();
const notFound = () => new Response(null, { status: 404 });

export async function GET(req: Request) {
  if (localBlocked()) return notFound();
  return handler.GET(req);
}

// Chế độ local: lệnh lưu / xóa của giao diện quản trị đi qua /api/keystatic/update.
// Đồng bộ ảnh với trang quản trị (nguyên tắc của Lộc): xóa bài / chủ đề / sách thì xóa luôn thư mục ảnh của mục đó, và sau mỗi lần lưu
// thì quét ảnh mồ côi (ảnh đã thay / gỡ, ảnh Cài đặt không còn dùng). Keystatic tự nó không làm các việc này.
// Lệnh ghi phải gửi từ chính trang quản trị (src/cms/lib/same-origin.ts), không nhận từ trang web khác.
export async function POST(req: Request) {
  if (localBlocked() || !isSameOriginRequest(req)) return notFound();
  let folders: string[] = [];
  let sweep = false;
  let update: Parameters<typeof removeHomeReferences>[0] = {};
  if (new URL(req.url).pathname.endsWith("/update")) {
    try {
      update = await req.clone().json();
      folders = imageFoldersToRemove(update);
      sweep = true;
    } catch {
      // thân yêu cầu không đọc được: để Keystatic tự báo lỗi
    }
  }
  const res = await handler.POST(req);
  if (res.ok && sweep) {
    if (folders.length) await removeImageFolders(folders);
    removeHomeReferences(update);
    await removeOrphanImages();
  }
  return res;
}
