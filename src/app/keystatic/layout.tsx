import type { ReactNode } from "react";
import { KeystaticThumbnails } from "./KeystaticThumbnails";

// Trang quản trị không cần SEO: không cho công cụ tìm kiếm lập chỉ mục.
export const metadata = { title: "Quản trị bài viết", robots: { index: false, follow: false } };

export default function KeystaticLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Cột ảnh trong danh sách hiện ảnh thu nhỏ thay vì đường dẫn chữ (Keystatic không có cột ảnh) */}
      <KeystaticThumbnails />
      {children}
    </>
  );
}
