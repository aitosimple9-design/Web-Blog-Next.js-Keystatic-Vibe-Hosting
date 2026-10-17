import type { ReactNode } from "react";
import { KeystaticBlocksColumns } from "./KeystaticBlocksColumns";
import { KeystaticThumbnails } from "./KeystaticThumbnails";
import { KeystaticSeoPanel } from "./SeoPanel";

// Trang quản trị không cần SEO: không cho công cụ tìm kiếm lập chỉ mục.
export const metadata = { title: "Quản trị bài viết", robots: { index: false, follow: false } };

export default function KeystaticLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Cột ảnh trong danh sách hiện ảnh thu nhỏ thay vì đường dẫn chữ (Keystatic không có cột ảnh) */}
      <KeystaticThumbnails />
      {/* Hộp điểm SEO trong form bài: chấm cả nội dung chưa lưu (nổi góc dưới bên phải) */}
      <KeystaticSeoPanel />
      {/* Nhóm "Các khối của trang": mỗi ô chiếm nửa hàng để đỡ dài */}
      <KeystaticBlocksColumns />
      {children}
    </>
  );
}
