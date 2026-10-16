import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";
import { imageFoldersToRemove, removeImageFolders } from "@/lib/content-cleanup";

const handler = makeRouteHandler({ config });

export const { GET } = handler;

// Chế độ local: lệnh lưu / xóa của giao diện quản trị đi qua /api/keystatic/update.
// Xóa bài / chủ đề / sách thì xóa luôn thư mục ảnh của mục đó (Keystatic tự nó không làm việc này).
export async function POST(req: Request) {
  let folders: string[] = [];
  if (new URL(req.url).pathname.endsWith("/update")) {
    try {
      folders = imageFoldersToRemove(await req.clone().json());
    } catch {
      // thân yêu cầu không đọc được: để Keystatic tự báo lỗi
    }
  }
  const res = await handler.POST(req);
  if (res.ok && folders.length) await removeImageFolders(folders);
  return res;
}
