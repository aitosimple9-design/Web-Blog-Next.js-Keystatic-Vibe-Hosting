import type { ReactNode } from "react";
import { KeystaticBlocksColumns } from "../../cms/ui/KeystaticBlocksColumns";
import { KeystaticNavIcons } from "../../cms/ui/KeystaticNavIcons";
import { KeystaticRedirectTools } from "../../cms/ui/KeystaticRedirectTools";
import { KeystaticBreadcrumb } from "../../cms/ui/KeystaticBreadcrumb";
import { KeystaticScrollbars } from "../../cms/ui/KeystaticScrollbars";
import { KeystaticSiteUrlCard } from "../../cms/ui/KeystaticSiteUrlCard";
import { KeystaticSettingsCards } from "../../cms/ui/KeystaticSettingsCards";
import { KeystaticThumbnails } from "../../cms/ui/KeystaticThumbnails";
import { KeystaticSeoPanel } from "../../cms/ui/SeoPanel";

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
      {/* Menu trái: icon trước từng mục + vạch phân cách giữa các nhóm */}
      <KeystaticNavIcons />
      {/* Nút "Tạo chuyển hướng" cạnh ô Slug và hộp "Thêm chuyển hướng" ở danh sách Chuyển hướng */}
      <KeystaticRedirectTools />
      {/* Trang cài đặt (singleton): mỗi ô thành một thẻ có tiêu đề, mô tả, chân thẻ như trang Settings của Vercel */}
      <KeystaticSettingsCards />
      {/* Thẻ "Địa chỉ web" đầu trang Cài đặt → Site (NEXT_PUBLIC_SITE_URL): đúng / tạm / còn localhost */}
      <KeystaticSiteUrlCard />
      {/* Thanh cuộn mảnh như Vercel; khung cuộn của form kéo ra sát mép phải */}
      <KeystaticScrollbars />
      {/* Thanh điều hướng "Bài viết > slug" gọn hơn */}
      <KeystaticBreadcrumb />
      {children}
    </>
  );
}
