import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";
import { imageFoldersToRemove, removeHomeReferences, removeImageFolders, removeOrphanImages } from "@/cms/lib/content-cleanup";

const handler = makeRouteHandler({ config });

export const { GET } = handler;

// Chế độ local: lệnh lưu / xóa của giao diện quản trị đi qua /api/keystatic/update.
// Đồng bộ ảnh với trang quản trị (nguyên tắc của Lộc): xóa bài / chủ đề / sách thì xóa luôn thư mục ảnh của mục đó, và sau mỗi lần lưu
// thì quét ảnh mồ côi (ảnh đã thay / gỡ, ảnh Cài đặt không còn dùng). Keystatic tự nó không làm các việc này.
export async function POST(req: Request) {
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
